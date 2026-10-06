import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';

/** Pipeline order, first to last. */
export const STATUS_ORDER: ProjectStatus[] = [
  'planned',
  'spike',
  'in_progress',
  'polishing',
  'shipped',
];

export const STATUS_META: Record<ProjectStatus, { label: string; color: string }> = {
  planned: { label: 'Planned', color: 'var(--st-planned)' },
  spike: { label: 'Exploring', color: 'var(--st-spike)' },
  in_progress: { label: 'In Progress', color: 'var(--st-in_progress)' },
  polishing: { label: 'Polishing', color: 'var(--st-polishing)' },
  shipped: { label: 'Shipped', color: 'var(--st-shipped)' },
};

export const PRIORITY_META: Record<PriorityLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_ORDER: PriorityLevel[] = ['high', 'medium', 'low'];

export const DONE_COLOR = 'var(--accent)';

// Categories keep one colour everywhere (sidebar, cards, table). Known names are pinned,
// anything new is spread over the same palette by name.
const KNOWN_CATEGORIES = ['App', 'CLI', 'Design', 'Gaming', 'Media', 'Tools', 'Web'];
export const categoryColor = (name: string) => {
  let i = KNOWN_CATEGORIES.indexOf(name);
  if (i < 0) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    i = h % 8;
  }
  return `var(--cat-${i})`;
};

// Vaults saved before priorities became High/Medium/Low and Backlog was merged into Planned
const LEGACY_PRIORITY: Record<string, PriorityLevel> = { P0: 'high', P1: 'high', P2: 'medium', P3: 'low' };
export const normalizeProject = (p: ProjectIdea): ProjectIdea => {
  const priority = LEGACY_PRIORITY[p.priority as string] ?? p.priority;
  const status = (p.status as string) === 'backlog' ? 'planned' : p.status;
  return priority === p.priority && status === p.status ? p : { ...p, priority, status };
};

export const progressOf = (project: ProjectIdea) => {
  const total = project.milestones.length;
  const done = project.milestones.filter((m) => m.completed).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
};
