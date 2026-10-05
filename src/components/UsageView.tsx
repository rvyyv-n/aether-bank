import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  PROVIDERS,
  PROVIDER_MODELS,
  buildSampleUsage,
  type Provider,
  type UsageEntry,
} from '../data/usage';

/** One day of usage for one model in one harness/project (as served by /usage.json). */
interface UsageRow {
  d: string; // YYYY-MM-DD (UTC)
  h: string; // harness
  p: string; // provider id
  n: string; // model display name
  j: string; // project
  in: number;
  out: number;
  cr: number; // cache reads
  cw: number; // cache writes
  msgs: number;
  cost: number | null;
}

interface UsagePayload {
  generatedAt: string;
  sources: { claudeFiles: number; antigravityConversations: number };
  rows: UsageRow[];
}

type Metric = 'tokens' | 'msgs' | 'spend';
type Dimension = 'model' | 'harness' | 'project';
type Mode = 'share' | 'volume';

const MANUAL_KEY = 'banker_usage_v1';
const RANGES = [7, 14, 30, 0] as const;
const DAY_MS = 86_400_000;

// Colour families per provider so related models read as one hue (as on slopalytics)
const FAMILIES: Record<string, string[]> = {
  anthropic: ['#e08a6b', '#b8684c', '#8f4f3a', '#d9b8a4', '#a35d45'],
  google: ['#4ade80', '#22c55e', '#86efac', '#16a34a'],
  openai: ['#e5e5e5', '#a3a3a3', '#737373', '#d4d4d4'],
  other: ['#a78bfa', '#818cf8', '#c4b5fd'],
};
const GENERIC = ['#e08a6b', '#4ade80', '#a78bfa', '#60a5fa', '#f59e0b', '#f472b6', '#2dd4bf', '#a3a3a3'];
const OTHER_COLOR = '#57534e';

const tokensOf = (r: UsageRow) => r.in + r.out + r.cw;
const valueOf = (r: UsageRow, m: Metric) =>
  m === 'tokens' ? tokensOf(r) : m === 'msgs' ? r.msgs : r.cost ?? 0;

const fmtNum = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)}B`
  : n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`
  : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`
  : String(Math.round(n));
const fmtMoney = (n: number) => (n >= 100 ? `$${Math.round(n)}` : `$${n.toFixed(2)}`);
const fmtMetric = (n: number, m: Metric) => (m === 'spend' ? fmtMoney(n) : fmtNum(n));
const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

function entriesToRows(entries: UsageEntry[]): UsageRow[] {
  return entries.map((e) => ({
    d: e.date,
    h: 'Manual',
    p: e.provider,
    n: e.model,
    j: e.project ?? 'Manual',
    in: e.inputTokens,
    out: e.outputTokens,
    cr: 0,
    cw: 0,
    msgs: 1,
    cost: null,
  }));
}

export const UsageView: React.FC = () => {
  const [now] = useState(() => Date.now());
  const [live, setLive] = useState<UsagePayload | null>(null);
  const [liveState, setLiveState] = useState<'loading' | 'ok' | 'offline'>('loading');
  const [manual, setManual] = useState<UsageEntry[]>(() => {
    try {
      const stored = localStorage.getItem(MANUAL_KEY);
      if (stored) return (JSON.parse(stored) as UsageEntry[]).filter((e) => !e.id.startsWith('sample-'));
    } catch (e) {
      console.error('Failed to parse stored usage', e);
    }
    return [];
  });
  const [metric, setMetric] = useState<Metric>('tokens');
  const [dimension, setDimension] = useState<Dimension>('model');
  const [mode, setMode] = useState<Mode>('share');
  const [range, setRange] = useState<number>(30);
  const [scrub, setScrub] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: dayKey(now),
    provider: 'anthropic' as Provider,
    model: PROVIDER_MODELS.anthropic[0],
    inputTokens: '',
    outputTokens: '',
  });

  useEffect(() => {
    let cancelled = false;
    fetch('./usage.json', { cache: 'no-store' })
      .then((r) => (r.ok && (r.headers.get('content-type') ?? '').includes('json') ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: UsagePayload) => {
        if (cancelled) return;
        setLive(data);
        setLiveState('ok');
      })
      .catch(() => {
        if (!cancelled) setLiveState('offline');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveManual = (next: UsageEntry[]) => {
    setManual(next);
    try {
      localStorage.setItem(MANUAL_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save usage', e);
    }
  };

  const allRows = useMemo<UsageRow[]>(() => {
    const base = live ? live.rows : liveState === 'offline' ? entriesToRows(buildSampleUsage()) : [];
    return [...base, ...entriesToRows(manual)];
  }, [live, liveState, manual]);

  // window of days (oldest -> newest), and the equally long window before it
  const { days, prevDays } = useMemo(() => {
    let span = range;
    if (span === 0) {
      const first = allRows.reduce((m, r) => (r.d < m ? r.d : m), dayKey(now));
      span = Math.max(1, Math.round((now - Date.parse(first)) / DAY_MS) + 1);
    }
    const mk = (offset: number) =>
      Array.from({ length: span }, (_, i) => dayKey(now - (span - 1 - i + offset) * DAY_MS));
    return { days: mk(0), prevDays: range === 0 ? [] : mk(span) };
  }, [range, allRows, now]);

  const analysis = useMemo(() => {
    const keyOf = (r: UsageRow) => (dimension === 'model' ? r.n : dimension === 'harness' ? r.h : r.j);
    const inWin = new Set(days);
    const inPrev = new Set(prevDays);
    const totals = new Map<string, number>();
    const prevTotals = new Map<string, number>();
    const providerOf = new Map<string, string>();
    const perDay = new Map<string, Map<string, number>>();
    let tokens = 0, cached = 0, msgs = 0, spend = 0, unpriced = 0, input = 0, output = 0;
    let prevGrand = 0;

    for (const r of allRows) {
      const k = keyOf(r);
      const v = valueOf(r, metric);
      if (inWin.has(r.d)) {
        totals.set(k, (totals.get(k) ?? 0) + v);
        providerOf.set(k, r.p);
        const day = perDay.get(r.d) ?? new Map<string, number>();
        day.set(k, (day.get(k) ?? 0) + v);
        perDay.set(r.d, day);
        tokens += tokensOf(r);
        input += r.in;
        output += r.out;
        cached += r.cr;
        msgs += r.msgs;
        if (r.cost == null) unpriced += tokensOf(r);
        else spend += r.cost;
      } else if (inPrev.has(r.d)) {
        prevTotals.set(k, (prevTotals.get(k) ?? 0) + v);
        prevGrand += v;
      }
    }

    const ranked = [...totals.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const grand = ranked.reduce((s, [, v]) => s + v, 0);
    const TOP = 6;
    const top = ranked.slice(0, TOP).map(([k]) => k);
    const hasOther = ranked.length > TOP;

    const used: Record<string, number> = {};
    const colorOf = new Map<string, string>();
    top.forEach((k, i) => {
      if (dimension === 'model') {
        const prov = providerOf.get(k) ?? 'other';
        const fam = FAMILIES[prov] ?? FAMILIES.other;
        const idx = used[prov] ?? 0;
        used[prov] = idx + 1;
        colorOf.set(k, fam[idx % fam.length]);
      } else {
        colorOf.set(k, GENERIC[i % GENERIC.length]);
      }
    });

    const series = top.map((k) => ({
      key: k,
      color: colorOf.get(k) as string,
      values: days.map((d) => perDay.get(d)?.get(k) ?? 0),
    }));
    if (hasOther) {
      series.push({
        key: 'Other',
        color: OTHER_COLOR,
        values: days.map((d) => {
          const m = perDay.get(d);
          if (!m) return 0;
          let s = 0;
          for (const [k, v] of m) if (!top.includes(k)) s += v;
          return s;
        }),
      });
    }

    const rows = ranked.map(([k, v]) => ({
      key: k,
      value: v,
      perDay: v / days.length,
      share: grand ? (v / grand) * 100 : 0,
      delta: prevGrand ? (v / grand) * 100 - ((prevTotals.get(k) ?? 0) / prevGrand) * 100 : null,
      color: colorOf.get(k) ?? OTHER_COLOR,
    }));

    return { series, rows, grand, tokens, input, output, cached, msgs, spend, unpriced, hasPrev: prevGrand > 0 };
  }, [allRows, days, prevDays, metric, dimension]);

  // ---- chart geometry ----
  const W = 360;
  const H = 190;
  const n = days.length;
  const dayTotals = useMemo(
    () => days.map((_, i) => analysis.series.reduce((s, x) => s + x.values[i], 0)),
    [days, analysis.series],
  );
  const maxY = mode === 'share' ? 100 : Math.max(1, ...dayTotals);
  const xAt = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const paths = useMemo(() => {
    const step = n > 1 ? W / (n - 1) : W;
    const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
    const y = (v: number) => H - (v / maxY) * H;
    // Runs of consecutive days with activity; idle days leave a gap instead of a spike.
    const runs: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      if (dayTotals[i] <= 0) continue;
      const last = runs[runs.length - 1];
      if (last && last[1] === i - 1) last[1] = i;
      else runs.push([i, i]);
    }
    const cum = new Array<number>(n).fill(0);
    const out: { key: string; color: string; d: string }[] = [];
    for (const s of analysis.series) {
      const lower = [...cum];
      for (let i = 0; i < n; i++) {
        const t = dayTotals[i];
        cum[i] += mode === 'share' ? (t ? (s.values[i] / t) * 100 : 0) : s.values[i];
      }
      runs.forEach(([from, to], ri) => {
        const idx = Array.from({ length: to - from + 1 }, (_, k) => from + k);
        // a lone active day gets a thin column so it stays visible
        const xs = from === to ? [x(from) - step * 0.3, x(from) + step * 0.3] : idx.map(x);
        const top = from === to ? [y(cum[from]), y(cum[from])] : idx.map((i) => y(cum[i]));
        const bot = from === to ? [y(lower[from]), y(lower[from])] : idx.map((i) => y(lower[i]));
        const up = xs.map((px, k) => `${px.toFixed(1)},${top[k].toFixed(1)}`);
        const down = xs.map((px, k) => `${px.toFixed(1)},${bot[k].toFixed(1)}`).reverse();
        out.push({ key: `${s.key}-${ri}`, color: s.color, d: `M${up.join('L')}L${down.join('L')}Z` });
      });
    }
    return out;
  }, [analysis.series, dayTotals, mode, n, maxY]);

  const yTicks =
    mode === 'share'
      ? [100, 75, 50, 25, 0].map((v) => `${v}%`)
      : [1, 0.75, 0.5, 0.25, 0].map((f) => fmtMetric(maxY * f, metric));
  const scrubDay = scrub != null ? days[scrub] : null;
  const scrubItems =
    scrub != null
      ? analysis.series
          .map((s) => ({ key: s.key, color: s.color, v: s.values[scrub] }))
          .filter((x) => x.v > 0)
          .sort((a, b) => b.v - a.v)
          .slice(0, 4)
      : [];

  const onScrub = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setScrub(Math.round(f * (n - 1)));
  };

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const inputTokens = Math.max(0, Number(form.inputTokens) || 0);
    const outputTokens = Math.max(0, Number(form.outputTokens) || 0);
    if (inputTokens + outputTokens === 0 || !form.model.trim()) return;
    saveManual([
      { id: `u-${Date.now()}`, date: form.date, provider: form.provider, model: form.model.trim(), inputTokens, outputTokens },
      ...manual,
    ]);
    setForm((f) => ({ ...f, inputTokens: '', outputTokens: '' }));
  };

  const tab = (active: boolean) =>
    `px-0.5 py-2 text-[13px] border-b-2 transition cursor-pointer whitespace-nowrap ${
      active ? 'text-[var(--fg)] border-[var(--accent)] font-medium' : 'text-[var(--fg-3)] border-transparent hover:text-[var(--fg-2)]'
    }`;
  const inputCls =
    'w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-2 py-1.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]';
  const labelCls = 'block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1';
  const cardLabel = 'text-[11px] font-mono text-[var(--fg-3)] uppercase tracking-wider';
  const metricNoun = metric === 'tokens' ? 'tokens' : metric === 'msgs' ? 'messages' : 'est. spend';
  const dimNoun = dimension === 'model' ? 'models' : dimension === 'harness' ? 'harnesses' : 'projects';
  const updated = live
    ? new Date(live.generatedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)] m-0">
            {dimension === 'model' ? 'Model' : dimension === 'harness' ? 'Harness' : 'Project'} usage
          </h1>
          <p className="text-xs text-[var(--fg-3)] mt-1 m-0">
            {liveState === 'ok' && live
              ? `from local logs: ${live.sources.claudeFiles} Claude Code sessions, ${live.sources.antigravityConversations} Antigravity conversations`
              : liveState === 'loading'
                ? 'reading local logs…'
                : 'sample data. Local usage is only available when served by the Banker server.'}
          </p>
        </div>
        {updated && <div className="text-[11px] text-[var(--fg-3)] text-right shrink-0">Updated {updated}</div>}
      </div>

      {/* Metric tabs */}
      <div className="flex gap-6 border-b border-[var(--line)] overflow-x-auto">
        {([['tokens', 'Tokens'], ['msgs', 'Messages'], ['spend', 'Est. spend']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setMetric(id)} className={tab(metric === id)}>{label}</button>
        ))}
      </div>

      {/* Range / mode / dimension */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-[var(--line)]">
        {RANGES.map((r) => (
          <button key={r} onClick={() => setRange(r)} className={tab(range === r)}>{r === 0 ? 'All' : `${r} days`}</button>
        ))}
        <span className="hidden sm:block w-px h-4 bg-[var(--line-2)]" />
        <button onClick={() => setMode('share')} className={tab(mode === 'share')}>Share</button>
        <button onClick={() => setMode('volume')} className={tab(mode === 'volume')}>Volume</button>
        <div className="sm:ml-auto flex gap-4 w-full sm:w-auto border-t sm:border-t-0 border-[var(--line)] sm:border-0">
          {([['model', 'Models'], ['harness', 'Harnesses'], ['project', 'Projects']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setDimension(id)} className={tab(dimension === id)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="slop-card p-3.5">
          <div className={cardLabel}>Tokens</div>
          <div className="text-xl font-semibold mt-1 tracking-tight text-[var(--accent)]">{fmtNum(analysis.tokens)}</div>
          <div className="text-[11px] text-[var(--fg-3)] mt-0.5">{fmtNum(analysis.input)} in · {fmtNum(analysis.output)} out</div>
        </div>
        <div className="slop-card p-3.5">
          <div className={cardLabel}>Cache reads</div>
          <div className="text-xl font-semibold mt-1 tracking-tight text-[var(--fg)]">{fmtNum(analysis.cached)}</div>
          <div className="text-[11px] text-[var(--fg-3)] mt-0.5">re-read context</div>
        </div>
        <div className="slop-card p-3.5">
          <div className={cardLabel}>Messages</div>
          <div className="text-xl font-semibold mt-1 tracking-tight text-[var(--fg)]">{fmtNum(analysis.msgs)}</div>
          <div className="text-[11px] text-[var(--fg-3)] mt-0.5">{fmtNum(analysis.msgs / days.length)} / day</div>
        </div>
        <div className="slop-card p-3.5">
          <div className={cardLabel}>Est. spend</div>
          <div className="text-xl font-semibold mt-1 tracking-tight text-[var(--fg)]">{fmtMoney(analysis.spend)}</div>
          <div className="text-[11px] text-[var(--fg-3)] mt-0.5">
            {analysis.unpriced > 0 ? `excl. ${fmtNum(analysis.unpriced)} unpriced` : 'list prices'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="flex justify-between gap-3 text-[11px] text-[var(--fg-3)] mb-2">
          <span>
            {fmtMetric(analysis.grand, metric)} {metricNoun} · {mode === 'share' ? `daily share of ${dimNoun}` : `daily ${metricNoun}`}
          </span>
          <span className="shrink-0">{days[0].slice(5)} – {days[n - 1].slice(5)} · UTC</span>
        </div>
        {analysis.grand === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs font-mono text-[var(--fg-3)] border border-dashed border-[var(--line)] rounded-md">
            {liveState === 'loading' ? 'Loading…' : 'No usage in this range.'}
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex flex-col justify-between text-[10px] font-mono text-[var(--fg-3)] text-right w-9 shrink-0 py-0.5" style={{ height: H }}>
              {yTicks.map((t, i) => <span key={i}>{t}</span>)}
            </div>
            <div className="flex-1 min-w-0 relative">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="w-full block touch-pan-y"
                style={{ height: H }}
                onPointerMove={onScrub}
                onPointerLeave={() => setScrub(null)}
              >
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                ))}
                {paths.map((p) => (
                  <path key={p.key} d={p.d} fill={p.color} />
                ))}
                {scrub != null && (
                  <line x1={xAt(scrub)} x2={xAt(scrub)} y1="0" y2={H} stroke="var(--fg)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.7" />
                )}
              </svg>
              {scrub != null && scrubDay && (
                <div
                  className="absolute top-1 z-10 rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] pointer-events-none shadow-lg"
                  style={{ left: `${(xAt(scrub) / W) * 100}%`, transform: `translateX(${scrub > n / 2 ? '-105%' : '5%'})` }}
                >
                  <div className="font-mono text-[var(--fg-3)] mb-1">{scrubDay}</div>
                  {scrubItems.map((x) => (
                    <div key={x.key} className="flex items-center gap-1.5 text-[var(--fg)]">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: x.color }} />
                      <span className="truncate max-w-[110px]">{x.key}</span>
                      <span className="font-mono text-[var(--fg-2)] ml-auto pl-2">{fmtMetric(x.v, metric)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-[10px] font-mono text-[var(--fg-3)] mt-1.5">
                <span>{days[0].slice(5)}</span>
                <span>{days[Math.floor((n - 1) / 2)].slice(5)}</span>
                <span>{days[n - 1].slice(5)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ranked table */}
      <div>
        <div className="grid grid-cols-[1.5rem_1fr_4.5rem_4.5rem] gap-x-2 text-[11px] text-[var(--fg-3)] pb-2 border-b border-[var(--line)]">
          <span />
          <span>{range === 0 ? 'All-time' : `${range}-day`} averages</span>
          <span className="text-right">Per day</span>
          <span className="text-right">Share</span>
        </div>
        {analysis.rows.map((r, i) => (
          <div key={r.key} className="grid grid-cols-[1.5rem_1fr_4.5rem_4.5rem] gap-x-2 items-center py-3 border-b border-[var(--line)]">
            <span className="text-[11px] font-mono text-[var(--fg-3)]">{i + 1}</span>
            <div className="min-w-0">
              <div className="text-sm truncate" style={{ color: r.color }}>{r.key}</div>
              <div
                className="h-[3px] rounded-full mt-1.5"
                style={{ background: r.color, width: `${Math.max(6, (r.value / analysis.rows[0].value) * 100)}%` }}
              />
            </div>
            <span className="text-right text-sm font-mono text-[var(--fg)]">{fmtMetric(r.perDay, metric)}</span>
            <div className="text-right">
              <div className="text-sm font-mono text-[var(--fg)]">{r.share.toFixed(1)}%</div>
              {analysis.hasPrev && r.delta != null && (
                <div className="text-[10px] font-mono text-[var(--fg-3)]">{r.delta >= 0 ? '+' : '−'}{Math.abs(r.delta).toFixed(1)}pp</div>
              )}
            </div>
          </div>
        ))}
        {analysis.rows.length === 0 && <p className="text-xs text-[var(--fg-3)] py-4 m-0">Nothing to rank yet.</p>}
      </div>

      {/* Manual log (for harnesses without local logs) */}
      <div className="slop-card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-3)] m-0">Manual entries</h3>
            <p className="text-[11px] text-[var(--fg-3)] mt-1 m-0">For tools that don't leave local logs.</p>
          </div>
          <button onClick={() => setShowForm((s) => !s)} className="btn-accent cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            <span>Log usage</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={addEntry} className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Provider</label>
              <select
                value={form.provider}
                onChange={(e) => {
                  const provider = e.target.value as Provider;
                  setForm({ ...form, provider, model: PROVIDER_MODELS[provider][0] });
                }}
                className={inputCls}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Model</label>
              <input list="usage-models" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputCls} />
              <datalist id="usage-models">
                {PROVIDER_MODELS[form.provider].map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelCls}>Input</label>
              <input type="number" min="0" placeholder="0" value={form.inputTokens} onChange={(e) => setForm({ ...form, inputTokens: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Output</label>
              <input type="number" min="0" placeholder="0" value={form.outputTokens} onChange={(e) => setForm({ ...form, outputTokens: e.target.value })} className={inputCls} />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-accent cursor-pointer w-full justify-center">Add</button>
            </div>
          </form>
        )}

        {manual.length > 0 && (
          <div className="mt-4 divide-y divide-[var(--line)]">
            {manual.slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-2 text-xs">
                <span className="font-mono text-[var(--fg-3)]">{e.date}</span>
                <span className="text-[var(--fg)] truncate">{e.model}</span>
                <span className="ml-auto font-mono text-[var(--fg-2)]">{fmtNum(e.inputTokens)} / {fmtNum(e.outputTokens)}</span>
                <button onClick={() => saveManual(manual.filter((x) => x.id !== e.id))} className="text-[var(--fg-3)] hover:text-[var(--fg)] cursor-pointer" aria-label="Delete entry">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
