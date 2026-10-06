// Read-only git status for the repo paths stored in the vault, plus the last day each
// project label showed up in the usage logs. Only folders under the allowed roots are read.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

// Vault paths are usually relative ("repos/aether"), so they resolve against these roots.
// BANKER_ROOT (path-delimited) replaces the defaults: this repo's parent folders and home.
function roots() {
  const env = process.env.BANKER_ROOT;
  const list = env
    ? env.split(path.delimiter)
    : [path.resolve(__dirname, '..', '..'), path.resolve(__dirname, '..', '..', '..'), os.homedir()];
  return list.filter(Boolean).map((r) => path.resolve(r));
}

const inside = (root, dir) => {
  const rel = path.relative(root, dir);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

function resolveRepo(p, allowed) {
  if (typeof p !== 'string' || !p || p.includes('\0')) return null;
  const candidates = path.isAbsolute(p)
    ? [p]
    : allowed.flatMap((r) => [path.join(r, p), path.join(r, path.basename(p))]);
  for (const c of candidates) {
    try {
      const dir = fs.realpathSync(c);
      if (!allowed.some((r) => inside(r, dir))) continue;
      if (fs.existsSync(path.join(dir, '.git'))) return dir;
    } catch {
      /* not on disk */
    }
  }
  return null;
}

function git(dir, args) {
  return execFileSync('git', args, { cwd: dir, encoding: 'utf8', timeout: 5000, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function statusOf(dir) {
  const info = { found: true };
  try {
    info.branch = git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']);
  } catch {
    /* no commits yet */
  }
  try {
    const [at, hash, subject] = git(dir, ['log', '-1', '--format=%cI%x1f%h%x1f%s']).split('\x1f');
    Object.assign(info, { commitAt: at, commit: hash, subject });
  } catch {
    /* empty repository */
  }
  try {
    info.dirty = git(dir, ['status', '--porcelain']).split('\n').filter(Boolean).length;
  } catch {
    /* ignore */
  }
  try {
    const [behind, ahead] = git(dir, ['rev-list', '--left-right', '--count', '@{u}...HEAD']).split(/\s+/).map(Number);
    Object.assign(info, { ahead, behind });
  } catch {
    /* no upstream */
  }
  return info;
}

function repoStatus(paths) {
  const allowed = roots();
  const out = {};
  for (const p of [...new Set(paths)].slice(0, 60)) {
    const dir = resolveRepo(p, allowed);
    out[p] = dir ? statusOf(dir) : { found: false };
  }
  return out;
}

// Latest usage day per project label (lowercase), from the collector's daily rows
function lastSeen(rows) {
  const seen = {};
  for (const r of rows || []) {
    const key = String(r.j || '').toLowerCase();
    if (key && (!seen[key] || r.d > seen[key])) seen[key] = r.d;
  }
  return seen;
}

module.exports = { repoStatus, lastSeen };
