import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2 } from 'lucide-react';
import { SortHead, AgentLogo } from './ui';
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
  sources: Record<string, number>; // harness -> log files found
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

// Cache reads are re-read context, so they're left out unless asked for
const tokensOf = (r: UsageRow, withCache = false) => r.in + r.out + r.cw + (withCache ? r.cr : 0);
const valueOf = (r: UsageRow, m: Metric, withCache: boolean) =>
  m === 'tokens' ? tokensOf(r, withCache) : m === 'msgs' ? r.msgs : r.cost ?? 0;

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

export const UsageView: React.FC<{ sideSlot: HTMLElement | null }> = ({ sideSlot }) => {
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
  const [withCache, setWithCache] = useState(false);
  const [rankSort, setRankSort] = useState<{ key: 'name' | 'value'; reversed: boolean }>({ key: 'value', reversed: false });
  const [hiddenHarnesses, setHiddenHarnesses] = useState<string[]>([]);
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

  // Harness totals for the sidebar list, busiest first
  const harnessList = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of allRows) m.set(r.h, (m.get(r.h) ?? 0) + tokensOf(r));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [allRows]);

  const visibleRows = useMemo(() => allRows.filter((r) => !hiddenHarnesses.includes(r.h)), [allRows, hiddenHarnesses]);

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

    for (const r of visibleRows) {
      const k = keyOf(r);
      const v = valueOf(r, metric, withCache);
      if (inWin.has(r.d)) {
        totals.set(k, (totals.get(k) ?? 0) + v);
        providerOf.set(k, r.p);
        const day = perDay.get(r.d) ?? new Map<string, number>();
        day.set(k, (day.get(k) ?? 0) + v);
        perDay.set(r.d, day);
        tokens += tokensOf(r, withCache);
        input += r.in;
        output += r.out;
        cached += r.cr;
        msgs += r.msgs;
        if (r.cost == null) unpriced += tokensOf(r, withCache);
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
  }, [visibleRows, days, prevDays, metric, dimension, withCache]);

  // ---- chart geometry ----
  const W = 360;
  const H = 300;
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
    // Share joins the days that have usage (idle days carry no mix to show); volume keeps every day,
    // so idle days fall to zero.
    const active: number[] = [];
    for (let i = 0; i < n; i++) if (dayTotals[i] > 0) active.push(i);
    const runs: number[][] = mode === 'share' ? (active.length ? [active] : []) : [Array.from({ length: n }, (_, i) => i)];
    const cum = new Array<number>(n).fill(0);
    const out: { key: string; color: string; d: string }[] = [];
    for (const s of analysis.series) {
      const lower = [...cum];
      for (let i = 0; i < n; i++) {
        const t = dayTotals[i];
        cum[i] += mode === 'share' ? (t ? (s.values[i] / t) * 100 : 0) : s.values[i];
      }
      runs.forEach((idx, ri) => {
        const lone = idx.length === 1;
        // a lone active day gets a thin column so it stays visible
        const xs = lone ? [x(idx[0]) - step * 0.3, x(idx[0]) + step * 0.3] : idx.map(x);
        const top = lone ? [y(cum[idx[0]]), y(cum[idx[0]])] : idx.map((i) => y(cum[i]));
        const bot = lone ? [y(lower[idx[0]]), y(lower[idx[0]])] : idx.map((i) => y(lower[i]));
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

  const sortRank = (key: 'name' | 'value') =>
    setRankSort((s) => (s.key === key ? { key, reversed: !s.reversed } : { key, reversed: false }));
  const rankedRows = [...analysis.rows].sort((a, b) => {
    const d = rankSort.key === 'name' ? a.key.localeCompare(b.key) : b.value - a.value;
    return rankSort.reversed ? -d : d;
  });

  const inputCls = 'field';
  const labelCls = 'field-label';
  const metricNoun = metric === 'tokens' ? 'tokens' : metric === 'msgs' ? 'messages' : 'est. spend';
  const dimNoun = dimension === 'model' ? 'models' : dimension === 'harness' ? 'harnesses' : 'projects';
  const updated = live
    ? new Date(live.generatedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;
  const sources = live ? Object.entries(live.sources).sort((a, b) => b[1] - a[1]) : [];
  const seg = <T extends string | number>(value: T, current: T, set: (v: T) => void, label: string) => (
    <button key={String(value)} aria-pressed={value === current} onClick={() => set(value)}>
      {label}
    </button>
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>
            Usage
            <span>{fmtMetric(analysis.grand, metric)} {metricNoun}</span>
          </h1>
          <p>
            {liveState === 'ok' && live
              ? `Read from local logs on this machine${updated ? `, updated ${updated}` : ''}`
              : liveState === 'loading'
                ? 'Reading local logs…'
                : 'Showing sample data. Local usage is only available when served by the Banker server.'}
          </p>
        </div>
        <div className="seg">
          {([['tokens', 'Tokens'], ['msgs', 'Messages'], ['spend', 'Est. spend']] as const).map(([id, label]) =>
            seg<Metric>(id, metric, setMetric, label)
          )}
        </div>
      </div>

      <div className="toolbar">
        <div className="seg">
          {RANGES.map((r) => seg<number>(r, range, setRange, r === 0 ? 'All time' : `${r} days`))}
        </div>
        <span className="seg-sep hide-phone" />
        <div className="seg">
          {seg<Mode>('share', mode, setMode, 'Share')}
          {seg<Mode>('volume', mode, setMode, 'Volume')}
        </div>
        <div className="seg sm:ml-auto">
          {([['model', 'Models'], ['harness', 'Harnesses'], ['project', 'Projects']] as const).map(([id, label]) =>
            seg<Dimension>(id, dimension, setDimension, label)
          )}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span>Tokens</span>
          <strong className="text-[var(--accent)]">{fmtNum(analysis.tokens)}</strong>
          <small>{fmtNum(analysis.input)} in · {fmtNum(analysis.output)} out</small>
        </div>
        <div className="stat">
          <span>Cache reads</span>
          <strong>{fmtNum(analysis.cached)}</strong>
          <small>
            <button className="text-button text-[11.5px]" onClick={() => setWithCache((c) => !c)}>
              {withCache ? 'Counted in tokens' : 'Not in tokens. Count them'}
            </button>
          </small>
        </div>
        <div className="stat">
          <span>Messages</span>
          <strong>{fmtNum(analysis.msgs)}</strong>
          <small>{fmtNum(analysis.msgs / days.length)} a day</small>
        </div>
        <div className="stat">
          <span>Est. spend</span>
          <strong>{analysis.spend > 0 ? fmtMoney(analysis.spend) : '–'}</strong>
          <small>
            {analysis.spend === 0 ? 'No price data' : analysis.unpriced > 0 ? `Excl. ${fmtNum(analysis.unpriced)} unpriced` : 'At list prices'}
          </small>
        </div>
      </div>

      {/* Chart */}
      <section>
        <div className="section-head">
          <h3>{mode === 'share' ? `Daily share of ${dimNoun}` : `Daily ${metricNoun}`}</h3>
          <span className="hint">
            {days[0].slice(5)} – {days[n - 1].slice(5)} · UTC{mode === 'share' ? ' · days without usage are skipped' : ''}
          </span>
        </div>
        {analysis.grand === 0 ? (
          <div className="h-48 flex items-center justify-center side-note border border-dashed border-[var(--line)] rounded-md mt-2">
            {liveState === 'loading' ? 'Loading…' : 'No usage in this range.'}
          </div>
        ) : (
          <div className="flex gap-2 mt-2">
            <div className="flex flex-col justify-between text-[11px] text-[var(--fg-3)] tabular-nums text-right w-9 shrink-0 py-0.5" style={{ height: H }}>
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
                  className="absolute top-1 z-10 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5 py-1.5 text-[12px] pointer-events-none shadow-lg"
                  style={{ left: `${(xAt(scrub) / W) * 100}%`, transform: `translateX(${scrub > n / 2 ? '-105%' : '5%'})` }}
                >
                  <div className="text-[var(--fg-3)] tabular-nums mb-1">{scrubDay}</div>
                  {scrubItems.map((x) => (
                    <div key={x.key} className="flex items-center gap-1.5 text-[var(--fg)]">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: x.color }} />
                      <span className="truncate max-w-[110px]">{x.key}</span>
                      <span className="tabular-nums text-[var(--fg-2)] ml-auto pl-2">{fmtMetric(x.v, metric)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-[11px] tabular-nums text-[var(--fg-3)] mt-1.5">
                <span>{days[0].slice(5)}</span>
                <span>{days[Math.floor((n - 1) / 2)].slice(5)}</span>
                <span>{days[n - 1].slice(5)}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Ranking */}
      <section>
        <div className="rank-row rank-head">
          <span />
          <span>
            <SortHead
              label={`${range === 0 ? 'All-time' : `${range}-day`} ranking`}
              active={rankSort.key === 'name'}
              reversed={rankSort.reversed}
              onClick={() => sortRank('name')}
            />
          </span>
          <span className="val">
            <SortHead label="Per day" active={rankSort.key === 'value'} reversed={rankSort.reversed} onClick={() => sortRank('value')} className="justify-end" />
          </span>
          <span className="val">
            <SortHead label="Share" active={rankSort.key === 'value'} reversed={rankSort.reversed} onClick={() => sortRank('value')} className="justify-end" />
          </span>
        </div>
        {rankedRows.map((r, i) => (
          <div key={r.key} className="rank-row">
            <span className="num">{i + 1}</span>
            <div className="min-w-0">
              <div className="truncate">{r.key}</div>
              <div className="rank-bar" style={{ background: r.color, width: `${Math.max(4, (r.value / analysis.rows[0].value) * 100)}%` }} />
            </div>
            <span className="val">{fmtMetric(r.perDay, metric)}</span>
            <span className="val">
              {r.share.toFixed(1)}%
              {analysis.hasPrev && r.delta != null && (
                <small>{r.delta >= 0 ? '+' : '−'}{Math.abs(r.delta).toFixed(1)}pp</small>
              )}
            </span>
          </div>
        ))}
        {analysis.rows.length === 0 && <p className="side-note py-4">Nothing to rank yet.</p>}
      </section>

      <div>
        {/* Manual log (for harnesses without local logs) */}
        <section>
          <div className="section-head">
            <h3>Manual entries</h3>
            <button onClick={() => setShowForm((s) => !s)} className="text-button inline-flex items-center gap-1">
              <Plus className="h-3 w-3" />
              {showForm ? 'Close' : 'Log usage'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={addEntry} className="grid grid-cols-2 gap-3 py-3 border-t border-[var(--line)]">
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
              <div className="col-span-2">
                <label className={labelCls}>Model</label>
                <input list="usage-models" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputCls} />
                <datalist id="usage-models">
                  {PROVIDER_MODELS[form.provider].map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={labelCls}>Input tokens</label>
                <input type="number" min="0" placeholder="0" value={form.inputTokens} onChange={(e) => setForm({ ...form, inputTokens: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Output tokens</label>
                <input type="number" min="0" placeholder="0" value={form.outputTokens} onChange={(e) => setForm({ ...form, outputTokens: e.target.value })} className={inputCls} />
              </div>
              <div className="col-span-2 flex justify-end">
                <button type="submit" className="btn-accent cursor-pointer">Add entry</button>
              </div>
            </form>
          )}

          {manual.length > 0
            ? manual.slice(0, 8).map((e) => (
                <div key={e.id} className="edit-row flex items-center gap-3 py-2 border-t border-[var(--line)] text-[13.5px]">
                  <span className="row-count">{e.date}</span>
                  <span className="text-[var(--fg)] truncate">{e.model}</span>
                  <span className="ml-auto row-count">{fmtNum(e.inputTokens)} / {fmtNum(e.outputTokens)}</span>
                  <span className="row-actions">
                    <button onClick={() => saveManual(manual.filter((x) => x.id !== e.id))} className="row-action" aria-label="Delete entry">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              ))
            : !showForm && <p className="side-note">None yet.</p>}
        </section>
      </div>
      {sideSlot &&
        createPortal(
          <>
            <div className="side-heading">
              <h2>
                Harnesses<span>{harnessList.length}</span>
              </h2>
            </div>
            <div className="flex gap-4 pb-2">
              <button className="text-button" onClick={() => setHiddenHarnesses([])}>
                Select all
              </button>
              <button className="text-button" onClick={() => setHiddenHarnesses(harnessList.map(([h]) => h))}>
                Clear
              </button>
            </div>
            <div>
              {harnessList.map(([h, t]) => {
                const shown = !hiddenHarnesses.includes(h);
                return (
                  <label key={h} className="model-row cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shown}
                      onChange={() => setHiddenHarnesses(shown ? [...hiddenHarnesses, h] : hiddenHarnesses.filter((x) => x !== h))}
                      className="accent-[var(--accent)]"
                    />
                    <AgentLogo name={h} />
                    <span className={`flex-1 truncate ${shown ? '' : 'text-[var(--fg-3)]'}`}>{h}</span>
                    <span className="row-count">{fmtNum(t)}</span>
                  </label>
                );
              })}
              {harnessList.length === 0 && (
                <p className="side-note">{liveState === 'loading' ? 'Reading…' : 'No local logs found.'}</p>
              )}
            </div>
            <p className="side-note">
              The selection applies to every number and chart on this page. Sidebar counts are tokens, cache reads
              excluded.
            </p>
            <details className="side-note">
              <summary className="cursor-pointer">Data &amp; sources</summary>
              <p className="mt-2">
                Read from the local logs of every coding agent on this machine that keeps token counts. Log the rest by
                hand.
              </p>
              {sources.map(([name, files]) => (
                <div key={name} className="flex items-center gap-3 py-1">
                  <span className="flex-1 truncate">{name}</span>
                  <span className="row-count">{files} files</span>
                </div>
              ))}
            </details>
          </>,
          sideSlot,
        )}
    </div>
  );
};
