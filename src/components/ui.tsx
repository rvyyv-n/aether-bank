import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Clock, GitBranch } from 'lucide-react';
import type { ProjectStatus, PriorityLevel } from '../types';
import { idleLabel, type Activity } from '../data/repos';
import { STATUS_ORDER, STATUS_META, PRIORITY_META, DONE_COLOR, categoryColor } from '../data/status';

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

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => (
  <span className={`pri-badge pri-${priority}`} title={`${PRIORITY_META[priority]} priority`}>
    {PRIORITY_META[priority]}
  </span>
);

/** Mark for a coding agent, loaded from public/logos/<name>.svg; falls back to a letter tile. */
export const AgentLogo: React.FC<{ name: string }> = ({ name }) => {
  const [missing, setMissing] = useState(false);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return missing ? (
    <span className="agent-logo agent-mono" aria-hidden="true">
      {name.charAt(0)}
    </span>
  ) : (
    <img className="agent-logo" src={`./logos/${slug}.svg`} alt="" onError={() => setMissing(true)} />
  );
};

/** Category name with its fixed colour. */
export const CategoryTag: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 ${className}`}>
    <i className="cat-dot" style={{ background: categoryColor(name) }} />
    {name}
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
