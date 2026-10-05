import React, { useMemo, useState } from 'react';
import { Gauge, Plus, Trash2 } from 'lucide-react';
import {
  PROVIDERS,
  PROVIDER_MODELS,
  buildSampleUsage,
  type Provider,
  type UsageEntry,
} from '../data/usage';

const USAGE_KEY = 'banker_usage_v1';
const RANGES = [
  { id: 7, label: '7d' },
  { id: 30, label: '30d' },
  { id: 0, label: 'All' },
] as const;

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)}K`
      : String(n);

const providerMeta = (id: Provider) => PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[3];
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export const UsageView: React.FC = () => {
  const [entries, setEntries] = useState<UsageEntry[]>(() => {
    try {
      const stored = localStorage.getItem(USAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored usage', e);
    }
    return buildSampleUsage();
  });
  const [now] = useState(() => new Date());
  const [range, setRange] = useState<number>(30);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: dayKey(now),
    provider: 'anthropic' as Provider,
    model: PROVIDER_MODELS.anthropic[0],
    inputTokens: '',
    outputTokens: '',
  });

  const save = (next: UsageEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(USAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save usage', e);
    }
  };

  const hasSample = entries.some((e) => e.id.startsWith('sample-'));

  const visible = useMemo(() => {
    if (range === 0) return entries;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (range - 1));
    const min = dayKey(cutoff);
    return entries.filter((e) => e.date >= min);
  }, [entries, range, now]);

  const totals = useMemo(() => {
    const input = visible.reduce((s, e) => s + e.inputTokens, 0);
    const output = visible.reduce((s, e) => s + e.outputTokens, 0);
    const byProvider = new Map<Provider, number>();
    const byModel = new Map<string, { provider: Provider; model: string; tokens: number }>();
    for (const e of visible) {
      const t = e.inputTokens + e.outputTokens;
      byProvider.set(e.provider, (byProvider.get(e.provider) ?? 0) + t);
      const key = `${e.provider}:${e.model}`;
      byModel.set(key, {
        provider: e.provider,
        model: e.model,
        tokens: (byModel.get(key)?.tokens ?? 0) + t,
      });
    }
    return {
      input,
      output,
      total: input + output,
      byProvider: [...byProvider.entries()].sort((a, b) => b[1] - a[1]),
      byModel: [...byModel.values()].sort((a, b) => b.tokens - a.tokens),
    };
  }, [visible]);

  // Daily stacked bars by provider
  const days = useMemo(() => {
    const span = range === 0 ? 30 : range;
    const out: { date: string; parts: Map<Provider, number>; total: number }[] = [];
    for (let i = span - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      out.push({ date: dayKey(d), parts: new Map(), total: 0 });
    }
    const index = new Map(out.map((d, i) => [d.date, i]));
    for (const e of visible) {
      const i = index.get(e.date);
      if (i === undefined) continue;
      const t = e.inputTokens + e.outputTokens;
      out[i].parts.set(e.provider, (out[i].parts.get(e.provider) ?? 0) + t);
      out[i].total += t;
    }
    return out;
  }, [visible, range, now]);
  const maxDay = Math.max(1, ...days.map((d) => d.total));

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const inputTokens = Math.max(0, Number(form.inputTokens) || 0);
    const outputTokens = Math.max(0, Number(form.outputTokens) || 0);
    if (inputTokens + outputTokens === 0 || !form.model.trim()) return;
    save([
      {
        id: `u-${Date.now()}`,
        date: form.date,
        provider: form.provider,
        model: form.model.trim(),
        inputTokens,
        outputTokens,
      },
      ...entries,
    ]);
    setForm((f) => ({ ...f, inputTokens: '', outputTokens: '' }));
  };

  const recent = [...visible].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  const inputCls =
    'w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-2 py-1.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]';
  const labelCls = 'block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1';
  const metricLabel = 'text-[11px] font-mono text-[var(--fg-3)] uppercase tracking-wider';

  return (
    <div className="sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="slop-card p-4">
          <div className={metricLabel}>Total tokens</div>
          <div className="text-2xl font-semibold mt-1 tracking-tight text-[var(--accent)]">{fmt(totals.total)}</div>
          <div className="text-xs text-[var(--fg-2)] mt-1">{visible.length} sessions</div>
        </div>
        <div className="slop-card p-4">
          <div className={metricLabel}>Input</div>
          <div className="text-2xl font-semibold mt-1 tracking-tight text-[var(--fg)]">{fmt(totals.input)}</div>
          <div className="text-xs text-[var(--fg-2)] mt-1">
            {totals.total ? Math.round((totals.input / totals.total) * 100) : 0}% of total
          </div>
        </div>
        <div className="slop-card p-4">
          <div className={metricLabel}>Output</div>
          <div className="text-2xl font-semibold mt-1 tracking-tight text-[var(--fg)]">{fmt(totals.output)}</div>
          <div className="text-xs text-[var(--fg-2)] mt-1">
            {totals.total ? Math.round((totals.output / totals.total) * 100) : 0}% of total
          </div>
        </div>
        <div className="slop-card p-4">
          <div className={metricLabel}>Top model</div>
          <div className="text-2xl font-semibold mt-1 tracking-tight text-[var(--fg)] truncate">
            {totals.byModel[0]?.model ?? '—'}
          </div>
          <div className="text-xs text-[var(--fg-2)] mt-1">
            {totals.byModel[0] ? `${fmt(totals.byModel[0].tokens)} tokens` : 'No usage yet'}
          </div>
        </div>
      </div>

      {/* Daily chart */}
      <div className="slop-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[var(--line)] gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--fg)] m-0 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--accent)]" />
              <span>Daily tokens</span>
            </h2>
            <p className="text-xs text-[var(--fg-2)] mt-0.5 m-0">
              {hasSample
                ? 'Showing sample data. Log your own usage below.'
                : 'Tokens per day, split by provider.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] self-start sm:self-auto">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                  range === r.id
                    ? 'bg-[var(--fg)] text-[var(--bg)] font-semibold'
                    : 'text-[var(--fg-2)] hover:text-[var(--fg)]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <div className="flex items-end gap-[3px] h-40">
            {days.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col-reverse min-w-0 h-full"
                title={`${d.date}: ${fmt(d.total)} tokens`}
              >
                {PROVIDERS.map((p) => {
                  const v = d.parts.get(p.id) ?? 0;
                  return v ? (
                    <div
                      key={p.id}
                      style={{ height: `${(v / maxDay) * 100}%`, backgroundColor: p.color }}
                    />
                  ) : null;
                })}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[var(--fg-3)] mt-2">
            <span>{days[0]?.date}</span>
            <span>{days[days.length - 1]?.date}</span>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {PROVIDERS.filter((p) => totals.byProvider.some(([id]) => id === p.id)).map((p) => (
              <span key={p.id} className="flex items-center gap-1.5 text-[11px] text-[var(--fg-2)]">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.color }} />
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Provider + model breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="slop-card p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-3)] m-0 mb-4">By provider</h3>
          <div className="space-y-3">
            {totals.byProvider.length === 0 && <p className="text-xs text-[var(--fg-3)] m-0">No usage in this range.</p>}
            {totals.byProvider.map(([id, tokens]) => {
              const meta = providerMeta(id);
              return (
                <div key={id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--fg)]">{meta.label}</span>
                    <span className="font-mono text-[var(--fg-2)]">
                      {fmt(tokens)} · {Math.round((tokens / totals.total) * 100)}%
                    </span>
                  </div>
                  <div className="slop-progress-track h-2">
                    <div
                      className="slop-progress-fill"
                      style={{ width: `${(tokens / totals.byProvider[0][1]) * 100}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="slop-card p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-3)] m-0 mb-4">By model</h3>
          <div className="space-y-3">
            {totals.byModel.length === 0 && <p className="text-xs text-[var(--fg-3)] m-0">No usage in this range.</p>}
            {totals.byModel.map((m) => (
              <div key={`${m.provider}:${m.model}`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--fg)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: providerMeta(m.provider).color }} />
                    {m.model}
                  </span>
                  <span className="font-mono text-[var(--fg-2)]">{fmt(m.tokens)}</span>
                </div>
                <div className="slop-progress-track h-2">
                  <div
                    className="slop-progress-fill"
                    style={{
                      width: `${(m.tokens / totals.byModel[0].tokens) * 100}%`,
                      backgroundColor: providerMeta(m.provider).color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="slop-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-3)] m-0">Recent sessions</h3>
          <div className="flex items-center gap-2">
            {hasSample && (
              <button
                onClick={() => save(entries.filter((e) => !e.id.startsWith('sample-')))}
                className="text-[11px] text-[var(--fg-2)] hover:text-[var(--fg)] cursor-pointer"
              >
                Clear sample data
              </button>
            )}
            <button onClick={() => setShowForm((s) => !s)} className="btn-accent cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              <span>Log usage</span>
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={addEntry} className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-5 pb-5 border-b border-[var(--line)]">
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

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10.5px] font-mono uppercase text-[var(--fg-3)]">
                <th className="font-normal pb-2">Date</th>
                <th className="font-normal pb-2">Provider</th>
                <th className="font-normal pb-2">Model</th>
                <th className="font-normal pb-2 text-right">Input</th>
                <th className="font-normal pb-2 text-right">Output</th>
                <th className="pb-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id} className="border-t border-[var(--line)]">
                  <td className="py-2 font-mono text-[var(--fg-2)]">{e.date}</td>
                  <td className="py-2 text-[var(--fg)]">{providerMeta(e.provider).label}</td>
                  <td className="py-2 text-[var(--fg)]">{e.model}</td>
                  <td className="py-2 text-right font-mono text-[var(--fg-2)]">{fmt(e.inputTokens)}</td>
                  <td className="py-2 text-right font-mono text-[var(--fg-2)]">{fmt(e.outputTokens)}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => save(entries.filter((x) => x.id !== e.id))}
                      className="text-[var(--fg-3)] hover:text-[var(--fg)] cursor-pointer"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-[var(--fg-3)]">No sessions logged in this range.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
