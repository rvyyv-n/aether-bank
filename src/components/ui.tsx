import React from 'react';
import type { ProjectStatus, PriorityLevel } from '../types';
import { STATUS_ORDER, STATUS_META, PRIORITY_META, DONE_COLOR } from '../data/status';

export const StatusDot: React.FC<{ status: ProjectStatus; className?: string }> = ({
  status,
  className = 'h-2 w-2',
}) => (
  <span
    className={`rounded-full flex-shrink-0 ${className}`}
    style={{ backgroundColor: STATUS_META[status].color }}
    aria-hidden="true"
  />
);

export const StatusOptions: React.FC<{ only?: ProjectStatus[] }> = ({ only = STATUS_ORDER }) => (
  <>
    {only.map((s) => (
      <option key={s} value={s}>
        {STATUS_META[s].label}
      </option>
    ))}
  </>
);

const PRIORITY_CLASS: Record<PriorityLevel, string> = {
  P0: 'font-semibold bg-rose-500/10 text-rose-500 border-rose-500/25',
  P1: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
  P2: 'text-[var(--fg-2)] border-[var(--line)]',
  P3: 'text-[var(--fg-3)] border-[var(--line)]',
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => (
  <span
    className={`px-1.5 rounded text-[10px] leading-4 font-mono font-medium border ${PRIORITY_CLASS[priority]}`}
    title={`${priority} · ${PRIORITY_META[priority]}`}
  >
    {priority}
  </span>
);

export const ProgressBar: React.FC<{ pct: number; className?: string }> = ({ pct, className = '' }) => (
  <div
    className={`slop-progress-track ${className}`}
    role="progressbar"
    aria-valuenow={pct}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className="slop-progress-fill"
      style={{ width: `${pct}%`, backgroundColor: pct === 100 ? DONE_COLOR : 'var(--accent)' }}
    />
  </div>
);
