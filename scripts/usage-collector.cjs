// Scans local AI harness logs and returns daily token usage.
//   - Claude Code:  ~/.claude/projects/**/*.jsonl   (per-message usage)
//   - Antigravity:  ~/.gemini/antigravity-acp/conversations/*.db   (gen_metadata protobuf)
// Prices come from T3's cached LiteLLM table when present.
const fs = require('fs');
const os = require('os');
const path = require('path');

const HOME = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude', 'projects');
const GEMINI_DIR = path.join(HOME, '.gemini', 'antigravity-acp', 'conversations');
const RATES_FILE = path.join(HOME, '.t3', 'userdata', 'usage-model-rates.json');
const CACHE_FILE = path.join(os.tmpdir(), 'banker-usage-cache-v1.json');

// ---------- helpers ----------
function walk(dir, ext, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

function projectLabel(dirName) {
  if (/t3code-claude-title/.test(dirName)) return 'T3 thread titles';
  let m = dirName.match(/--t3-worktrees-([^-]+)/);
  if (m) return m[1];
  if (/--t3-scratch/.test(dirName)) return 'T3 scratch';
  m = dirName.match(/^[A-Z]--(?:Code-(?:Repos|Claude)-)?(.+)$/);
  if (m) {
    const rest = m[1].replace(/^Users-[^-]+-?/, '');
    return rest || 'home';
  }
  return dirName;
}

function prettyModel(id) {
  const s = id.replace(/-\d{8}$/, '');
  let m = s.match(/^claude-(opus|sonnet|haiku|fable)-(\d+)(?:-(\d+))?$/);
  if (m) return `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}${m[3] ? '.' + m[3] : ''}`;
  m = s.match(/^gemini-(\d+(?:\.\d+)?)-(flash|pro)/);
  if (m) return `Gemini ${m[1]} ${m[2][0].toUpperCase()}${m[2].slice(1)}`;
  return s;
}

// ---------- rates ----------
let rates = null;
function loadRates() {
  if (rates) return rates;
  try {
    rates = JSON.parse(fs.readFileSync(RATES_FILE, 'utf8')).document || {};
  } catch {
    rates = {};
  }
  return rates;
}
const rateCache = new Map();
function rateFor(model) {
  if (rateCache.has(model)) return rateCache.get(model);
  const doc = loadRates();
  const base = model.replace(/-\d{8}$/, '');
  const candidates = [model, base, `anthropic/${model}`, `anthropic/${base}`, `anthropic.${base}`, `gemini/${model}`, `gemini/${base}`];
  let hit = null;
  for (const c of candidates) {
    if (doc[c] && doc[c].input_cost_per_token != null) {
      hit = doc[c];
      break;
    }
  }
  const r = hit && {
    in: hit.input_cost_per_token || 0,
    out: hit.output_cost_per_token || 0,
    cr: hit.cache_read_input_token_cost ?? (hit.input_cost_per_token || 0) * 0.1,
    cw: hit.cache_creation_input_token_cost ?? (hit.input_cost_per_token || 0) * 1.25,
  };
  rateCache.set(model, r || null);
  return r || null;
}

// ---------- Claude Code ----------
function scanClaudeFile(file) {
  const proj = projectLabel(path.basename(path.dirname(file)));
  const msgs = new Map(); // dedupe: per message id keep the max of each counter
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split('\n')) {
    if (!line.includes('"usage"')) continue;
    let j;
    try {
      j = JSON.parse(line);
    } catch {
      continue;
    }
    const m = j.message;
    if (!m || !m.usage || !m.model || m.model === '<synthetic>') continue;
    const u = m.usage;
    const key = m.id || j.uuid;
    const prev = msgs.get(key);
    const rec = {
      ts: Date.parse(j.timestamp) || 0,
      model: m.model,
      proj,
      in: u.input_tokens || 0,
      out: u.output_tokens || 0,
      cr: u.cache_read_input_tokens || 0,
      cw: u.cache_creation_input_tokens || 0,
    };
    if (prev) {
      rec.in = Math.max(rec.in, prev.in);
      rec.out = Math.max(rec.out, prev.out);
      rec.cr = Math.max(rec.cr, prev.cr);
      rec.cw = Math.max(rec.cw, prev.cw);
      rec.ts = prev.ts || rec.ts;
    }
    msgs.set(key, rec);
  }
  return [...msgs.entries()];
}

// ---------- Antigravity (Gemini) ----------
// gen_metadata.data is a protobuf: field 1 -> { 4: usage{2:input,3:output,5:cacheRead},
// 9.4.1: epoch seconds, 19/21: model name }.
function readVarint(buf, state) {
  let r = 0n;
  let s = 0n;
  while (state.i < buf.length) {
    const b = buf[state.i++];
    r |= BigInt(b & 0x7f) << s;
    if (!(b & 0x80)) break;
    s += 7n;
  }
  return r;
}
function parsePb(buf) {
  const fields = [];
  const st = { i: 0 };
  try {
    while (st.i < buf.length) {
      const tag = readVarint(buf, st);
      const f = Number(tag >> 3n);
      const w = Number(tag & 7n);
      if (w === 0) fields.push([f, readVarint(buf, st)]);
      else if (w === 1) st.i += 8;
      else if (w === 5) st.i += 4;
      else if (w === 2) {
        const l = Number(readVarint(buf, st));
        fields.push([f, buf.subarray(st.i, st.i + l)]);
        st.i += l;
      } else break;
    }
  } catch {
    /* partial parse is fine */
  }
  return fields;
}
const sub = (fields, n) => {
  const f = fields.find(([k, v]) => k === n && Buffer.isBuffer(v));
  return f ? parsePb(f[1]) : [];
};
const num = (fields, n) => {
  const f = fields.find(([k, v]) => k === n && typeof v === 'bigint');
  return f ? Number(f[1]) : 0;
};
const str = (fields, n) => {
  const f = fields.find(([k, v]) => k === n && Buffer.isBuffer(v));
  return f ? f[1].toString('utf8') : '';
};

function scanGeminiFile(file) {
  let DatabaseSync;
  try {
    ({ DatabaseSync } = require('node:sqlite'));
  } catch {
    return [];
  }
  const out = [];
  let db;
  try {
    db = new DatabaseSync(file, { readOnly: true });
    const rows = db.prepare('select idx, data from gen_metadata').all();
    const conv = path.basename(file, '.db');
    for (const r of rows) {
      const top = parsePb(Buffer.from(r.data));
      const body = sub(top, 1);
      const usage = sub(body, 4);
      const input = num(usage, 2);
      const output = num(usage, 3);
      const cacheRead = num(usage, 5);
      if (!input && !output && !cacheRead) continue;
      const ts = num(sub(sub(body, 9), 4), 1) * 1000;
      const model = str(body, 19) || str(body, 21);
      if (!model) continue;
      out.push([`g:${conv}:${r.idx}`, { ts, model, proj: 'Antigravity', in: input, out: output, cr: cacheRead, cw: 0 }]);
    }
  } catch {
    /* locked or unreadable db: skip */
  } finally {
    try {
      if (db) db.close();
    } catch {
      /* ignore */
    }
  }
  return out;
}

// ---------- collect ----------
function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function collect() {
  const cache = loadCache();
  const next = {};
  const all = new Map(); // global dedupe (resumed sessions replay old messages)

  const sources = [
    ...walk(CLAUDE_DIR, '.jsonl').map((f) => ({ f, kind: 'claude', harness: 'Claude Code', provider: 'anthropic' })),
    ...walk(GEMINI_DIR, '.db').map((f) => ({ f, kind: 'gemini', harness: 'Antigravity', provider: 'google' })),
  ];

  for (const s of sources) {
    let st;
    try {
      st = fs.statSync(s.f);
    } catch {
      continue;
    }
    // Active Gemini dbs change inside the -wal file, so key on all sibling stats.
    let sig = `${st.size}:${st.mtimeMs}`;
    if (s.kind === 'gemini') {
      for (const x of ['-wal']) {
        try {
          const w = fs.statSync(s.f + x);
          sig += `:${w.size}:${w.mtimeMs}`;
        } catch {
          /* no wal */
        }
      }
    }
    let rows = cache[s.f] && cache[s.f].sig === sig ? cache[s.f].rows : null;
    if (!rows) rows = s.kind === 'claude' ? scanClaudeFile(s.f) : scanGeminiFile(s.f);
    next[s.f] = { sig, rows };
    for (const [k, rec] of rows) {
      if (!all.has(k)) all.set(k, { ...rec, harness: s.harness, provider: s.provider });
    }
  }
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(next));
  } catch {
    /* cache is optional */
  }

  // aggregate to daily rows
  const daily = new Map();
  let first = Infinity;
  let last = 0;
  for (const r of all.values()) {
    if (!r.ts) continue;
    const date = new Date(r.ts).toISOString().slice(0, 10);
    const key = [date, r.harness, r.model, r.proj].join('|');
    let d = daily.get(key);
    if (!d) {
      const rate = rateFor(r.model);
      d = { d: date, h: r.harness, p: r.provider, m: r.model, n: prettyModel(r.model), j: r.proj, in: 0, out: 0, cr: 0, cw: 0, msgs: 0, cost: rate ? 0 : null };
      daily.set(key, d);
    }
    d.in += r.in;
    d.out += r.out;
    d.cr += r.cr;
    d.cw += r.cw;
    d.msgs += 1;
    if (d.cost != null) {
      const rate = rateFor(r.model);
      d.cost += r.in * rate.in + r.out * rate.out + r.cr * rate.cr + r.cw * rate.cw;
    }
    first = Math.min(first, r.ts);
    last = Math.max(last, r.ts);
  }

  return {
    generatedAt: new Date().toISOString(),
    sources: { claudeFiles: sources.filter((s) => s.kind === 'claude').length, antigravityConversations: sources.filter((s) => s.kind === 'gemini').length },
    range: { from: first === Infinity ? null : new Date(first).toISOString(), to: last ? new Date(last).toISOString() : null },
    rows: [...daily.values()].sort((a, b) => a.d.localeCompare(b.d)),
  };
}

module.exports = { collect };

if (require.main === module) {
  const t = Date.now();
  const data = collect();
  const tot = data.rows.reduce((a, r) => ({ in: a.in + r.in, out: a.out + r.out, cr: a.cr + r.cr, cw: a.cw + r.cw, msgs: a.msgs + r.msgs, cost: a.cost + (r.cost || 0) }), { in: 0, out: 0, cr: 0, cw: 0, msgs: 0, cost: 0 });
  console.log(JSON.stringify({ ms: Date.now() - t, sources: data.sources, range: data.range, rows: data.rows.length, tot }, null, 1));
  const byModel = {};
  for (const r of data.rows) byModel[r.h + ' / ' + r.n] = (byModel[r.h + ' / ' + r.n] || 0) + r.in + r.out + r.cr + r.cw;
  console.log(byModel);
}
