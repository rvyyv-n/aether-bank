import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus, SortProps } from '../types';
import { Check, ChevronRight, Copy, ListTodo, PackageCheck, Zap } from 'lucide-react';
import { StatusDot, PriorityBadge, ProgressBar, SortHead } from './ui';
import { STATUS_META, progressOf } from '../data/status';

interface VaultOverviewProps extends SortProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
}

const ACTIVE: ProjectStatus[] = ['in_progress', 'polishing'];
const NEXT: ProjectStatus[] = ['spike', 'planned', 'backlog'];

const ActiveCard: React.FC<{ project: ProjectIdea; onOpen: () => void }> = ({ project, onOpen }) => {
  const [copied, setCopied] = useState(false);
  const { done, total, pct } = progressOf(project);
  const next = project.milestones.find((m) => !m.completed);
  const cmd = project.commands?.[0]?.cmd;

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cmd) return;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article
      className="focus-card"
      tabIndex={0}
      role="button"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="flex items-center gap-2 text-[12px] text-[var(--fg-3)]">
        <StatusDot status={project.status} />
        <span>{STATUS_META[project.status].label}</span>
        <span>&middot; {project.category}</span>
        <span className="ml-auto">
          <PriorityBadge priority={project.priority} />
        </span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.subtitle}</p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[12px] text-[var(--fg-3)] mb-1.5">
          <span>{next ? 'Next' : 'All milestones done'}</span>
          <span className="tabular-nums">
            {done}/{total} &middot; {pct}%
          </span>
        </div>
        <ProgressBar pct={pct} />
        {next && <div className="mt-2 text-[13px] text-[var(--fg)] truncate">{next.text}</div>}
      </div>

      <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--fg-3)]">
        <span className="truncate">{project.techStack.slice(0, 3).join(', ')}</span>
        {cmd && (
          <button className="ml-auto flex items-center gap-1.5 hover:text-[var(--fg)] shrink-0" onClick={copy} title={`Copy: ${cmd}`}>
            <span className="font-mono truncate max-w-[9rem]">{cmd}</span>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>
    </article>
  );
};

const Row: React.FC<{ project: ProjectIdea; onOpen: () => void }> = ({ project, onOpen }) => {
  const { done, total } = progressOf(project);
  return (
    <button onClick={onOpen} className="list-row">
      <StatusDot status={project.status} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[var(--fg)]">{project.title}</span>
        <span className="block truncate text-[12px] text-[var(--fg-3)]">{project.subtitle}</span>
      </span>
      <span className="hide-phone text-[12px] text-[var(--fg-3)]">{STATUS_META[project.status].label}</span>
      <PriorityBadge priority={project.priority} />
      <span className="w-10 text-right text-[12px] tabular-nums text-[var(--fg-3)]">
        {done}/{total}
      </span>
    </button>
  );
};

export const VaultOverview: React.FC<VaultOverviewProps> = ({
  projects,
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
      <span className="w-8 text-center">{head('priority', 'Pri')}</span>
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
              <ActiveCard key={p.id} project={p} onOpen={() => onSelectProject(p)} />
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
              <Row key={p.id} project={p} onOpen={() => onSelectProject(p)} />
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
                <Row key={p.id} project={p} onOpen={() => onSelectProject(p)} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
