import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus, SortProps } from '../types';
import { ChevronRight, ListTodo, PackageCheck, Zap } from 'lucide-react';
import { StatusDot, PriorityBadge, SortHead } from './ui';
import { ProjectCard } from './ProjectCard';
import { idleLabel, type Activity, type ActivityMap } from '../data/repos';
import { STATUS_META, progressOf } from '../data/status';

interface VaultOverviewProps extends SortProps {
  projects: ProjectIdea[];
  activity: ActivityMap;
  onSelectProject: (project: ProjectIdea) => void;
}

const ACTIVE: ProjectStatus[] = ['in_progress', 'polishing'];
const NEXT: ProjectStatus[] = ['spike', 'planned'];

const Row: React.FC<{ project: ProjectIdea; activity?: Activity; onOpen: () => void }> = ({ project, activity, onOpen }) => {
  const { done, total } = progressOf(project);
  return (
    <button onClick={onOpen} className="list-row">
      <StatusDot status={project.status} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[var(--fg)]">{project.title}</span>
        <span className="block truncate text-[12px] text-[var(--fg-3)]">{project.subtitle}</span>
      </span>
      <span className="hide-phone text-[12px] text-[var(--fg-3)]">{STATUS_META[project.status].label}</span>
      <span className="hide-phone w-20 text-right text-[12px] text-[var(--fg-3)]">{idleLabel(activity?.daysIdle)}</span>
      <span className="w-16 flex justify-center">
        <PriorityBadge priority={project.priority} />
      </span>
      <span className="w-10 text-right text-[12px] tabular-nums text-[var(--fg-3)]">
        {done}/{total}
      </span>
    </button>
  );
};

export const VaultOverview: React.FC<VaultOverviewProps> = ({
  projects,
  activity,
  onSelectProject,
  sortBy,
  sortReversed,
  onSort,
}) => {
  const head = (key: SortProps['sortBy'], label: string, className = '') => (
    <SortHead label={label} active={sortBy === key} reversed={sortReversed} onClick={() => onSort(key)} className={className} />
  );
  const listHead = (
    <div className="list-row list-head">
      <span className="w-2" />
      <span className="flex-1">{head('title', 'Project')}</span>
      <span className="hide-phone">{head('status', 'Status')}</span>
      <span className="hide-phone w-20 text-right">Active</span>
      <span className="w-16 flex justify-center">{head('priority', 'Priority')}</span>
      <span className="w-10 flex justify-end">{head('progress', 'Done')}</span>
    </div>
  );
  const [showShipped, setShowShipped] = useState(false);

  const active = projects.filter((p) => ACTIVE.includes(p.status));
  const next = projects.filter((p) => NEXT.includes(p.status));
  const shipped = projects.filter((p) => p.status === 'shipped');

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>
            Vault
            <span>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
          </h1>
          <p>What you are building now, what is queued and what has shipped.</p>
        </div>
      </div>

      {projects.length === 0 && (
        <p className="side-note py-10 text-center">No projects match the active filters.</p>
      )}

      {active.length > 0 && (
        <section>
          <div className="section-head">
            <h3 className="inline-flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
              Active
            </h3>
            <span className="hint">{active.length} in flight</span>
          </div>
          <div className="focus-grid mt-3">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} activity={activity[p.id]} onOpen={() => onSelectProject(p)} />
            ))}
          </div>
        </section>
      )}

      {next.length > 0 && (
        <section>
          <div className="section-head">
            <h3 className="inline-flex items-center gap-2">
              <ListTodo className="h-3.5 w-3.5 text-[var(--accent)]" />
              Up next
            </h3>
            <span className="hint">{next.length} queued</span>
          </div>
          <div className="mt-1">
            {listHead}
            {next.map((p) => (
              <Row key={p.id} project={p} activity={activity[p.id]} onOpen={() => onSelectProject(p)} />
            ))}
          </div>
        </section>
      )}

      {shipped.length > 0 && (
        <section>
          <div className="section-head">
            <h3 className="inline-flex items-center gap-2">
              <PackageCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              Shipped
            </h3>
            <button className="text-button inline-flex items-center gap-1" onClick={() => setShowShipped((s) => !s)}>
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showShipped ? 'rotate-90' : ''}`} />
              {showShipped ? 'Hide' : `Show ${shipped.length}`}
            </button>
          </div>
          {showShipped && (
            <div className="mt-1">
              {listHead}
              {shipped.map((p) => (
                <Row key={p.id} project={p} activity={activity[p.id]} onOpen={() => onSelectProject(p)} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
