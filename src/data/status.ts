import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';

/** Pipeline order, left to right on the board. */
export const STATUS_ORDER: ProjectStatus[] = [
  'backlog',
  'planned',
  'spike',
  'in_progress',
  'polishing',
  'shipped',
];

export const STATUS_META: Record<ProjectStatus, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'var(--st-backlog)' },
  planned: { label: 'Planned', color: 'var(--st-planned)' },
  spike: { label: 'Exploring', color: 'var(--st-spike)' },
  in_progress: { label: 'In Progress', color: 'var(--st-in_progress)' },
  polishing: { label: 'Polishing', color: 'var(--st-polishing)' },
  shipped: { label: 'Shipped', color: 'var(--accent)' },
};

export const PRIORITY_META: Record<PriorityLevel, string> = {
  P0: 'Critical',
  P1: 'High',
  P2: 'Standard',
  P3: 'Backburner',
};

export const DONE_COLOR = STATUS_META.shipped.color;

export const progressOf = (project: ProjectIdea) => {
  const total = project.milestones.length;
  const done = project.milestones.filter((m) => m.completed).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
};
