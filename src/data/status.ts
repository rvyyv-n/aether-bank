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
  backlog: { label: 'Backlog', color: '#71717a' },
  planned: { label: 'Planned', color: '#3b82f6' },
  spike: { label: 'Exploring', color: '#f59e0b' },
  in_progress: { label: 'In Progress', color: '#10b981' },
  polishing: { label: 'Polishing', color: '#0ea5e9' },
  shipped: { label: 'Shipped', color: '#a855f7' },
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
