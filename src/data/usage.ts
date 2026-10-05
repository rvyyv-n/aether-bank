export type Provider = 'anthropic' | 'google' | 'openai' | 'other';

export interface UsageEntry {
  id: string;
  date: string; // YYYY-MM-DD
  provider: Provider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  project?: string;
}

export const PROVIDERS: { id: Provider; label: string; color: string }[] = [
  { id: 'anthropic', label: 'Anthropic', color: '#c5ac98' },
  { id: 'google', label: 'Google', color: '#60a5fa' },
  { id: 'openai', label: 'OpenAI', color: '#34d399' },
  { id: 'other', label: 'Other', color: '#a78bfa' },
];

export const PROVIDER_MODELS: Record<Provider, string[]> = {
  anthropic: ['Opus 5.5', 'Sonnet 5.5', 'Haiku 4.5'],
  google: ['Gemini 3.8 Pro', 'Gemini 3.8 Flash'],
  openai: ['GPT-5', 'GPT-5 mini'],
  other: ['Local model'],
};

// Deterministic sample data so the page has something to show on first load.
export function buildSampleUsage(): UsageEntry[] {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const mix: { provider: Provider; model: string; weight: number; scale: number }[] = [
    { provider: 'anthropic', model: 'Opus 5.5', weight: 0.8, scale: 220_000 },
    { provider: 'anthropic', model: 'Sonnet 5.5', weight: 0.95, scale: 340_000 },
    { provider: 'anthropic', model: 'Haiku 4.5', weight: 0.85, scale: 120_000 },
    { provider: 'google', model: 'Gemini 3.8 Pro', weight: 0.75, scale: 260_000 },
    { provider: 'google', model: 'Gemini 3.8 Flash', weight: 0.9, scale: 420_000 },
    { provider: 'openai', model: 'GPT-5', weight: 0.6, scale: 150_000 },
  ];
  const entries: UsageEntry[] = [];
  const today = new Date();
  for (let d = 29; d >= 0; d--) {
    const day = new Date(today);
    day.setDate(today.getDate() - d);
    const date = day.toISOString().slice(0, 10);
    for (const m of mix) {
      if (rand() > m.weight) continue;
      const input = Math.round((m.scale * (0.2 + rand())) / 1000) * 1000;
      const output = Math.round((input * (0.08 + rand() * 0.12)) / 100) * 100;
      entries.push({
        id: `sample-${date}-${m.model}`,
        date,
        provider: m.provider,
        model: m.model,
        inputTokens: input,
        outputTokens: output,
      });
    }
  }
  return entries;
}
