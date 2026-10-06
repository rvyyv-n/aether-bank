import React from 'react';
import { ArrowDown, ArrowUp, Clock, GitBranch } from 'lucide-react';
import type { ProjectStatus, PriorityLevel } from '../types';
import { idleLabel, type Activity } from '../data/repos';
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
    className={`px-1.5 rounded text-[11px] leading-4 font-mono font-medium border ${PRIORITY_CLASS[priority]}`}
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

/** Branch, uncommitted files and last activity for a project folder; nothing when unknown. */
export const RepoLine: React.FC<{ activity?: Activity; className?: string }> = ({ activity, className = '' }) => {
  if (!activity || (!activity.repo?.found && activity.daysIdle === undefined)) return null;
  const repo = activity.repo?.found ? activity.repo : undefined;
  return (
    <div className={`repo-line ${className}`}>
      {repo?.branch && (
        <span title={repo.subject ? `${repo.commit}: ${repo.subject}` : undefined}>
          <GitBranch className="h-3 w-3" />
          {repo.branch}
        </span>
      )}
      {!!repo?.dirty && <span className="warn">{repo.dirty} uncommitted</span>}
      {!!repo?.ahead && <span>{repo.ahead} unpushed</span>}
      {activity.daysIdle !== undefined && (
        <span className={activity.daysIdle >= 14 ? 'warn' : ''}>
          <Clock className="h-3 w-3" />
          {idleLabel(activity.daysIdle)}
        </span>
      )}
    </div>
  );
};

/** Clickable column head; shows an arrow while it is the active sort. */
export const SortHead: React.FC<{
  label: string;
  active: boolean;
  reversed: boolean;
  onClick: () => void;
  className?: string;
}> = ({ label, active, reversed, onClick, className = '' }) => (
  <button type="button" className={`sort-head ${className}`} aria-pressed={active} onClick={onClick}>
    {label}
    {active && (reversed ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
  </button>
);
