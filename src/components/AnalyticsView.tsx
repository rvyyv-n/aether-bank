import React, { useState } from 'react';
import type { ProjectIdea, SortProps } from '../types';
import { Boxes, Flag, Layers, TrendingUp } from 'lucide-react';
import { StatusDot, ProgressBar, SortHead } from './ui';
import { ProjectCard } from './ProjectCard';
import { STATUS_ORDER, STATUS_META, PRIORITY_META, PRIORITY_ORDER, DONE_COLOR } from '../data/status';
import type { ActivityMap } from '../data/repos';

interface AnalyticsViewProps extends SortProps {
  projects: ProjectIdea[];
  activity: ActivityMap;
  onSelectProject: (project: ProjectIdea) => void;
}

type Chart = 'velocity' | 'distribution' | 'tech';

const CHARTS: [Chart, string][] = [
  ['velocity', 'Progress'],
  ['distribution', 'Stages'],
  ['tech', 'Stack'],
];

const doneCount = (p: ProjectIdea) => p.milestones.filter((m) => m.completed).length;

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  projects,
  activity,
  onSelectProject,
  sortBy,
  sortReversed,
  onSort,
}) => {
  const [chart, setChart] = useState<Chart>('velocity');

  const totalMilestones = projects.reduce((n, p) => n + p.milestones.length, 0);
  const completedMilestones = projects.reduce((n, p) => n + doneCount(p), 0);
  const overall = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const count = (status: ProjectIdea['status']) => projects.filter((p) => p.status === status).length;
  const shipped = count('shipped');

  const techMap: Record<string, number> = {};
  projects.forEach((p) => p.techStack.forEach((t) => (techMap[t] = (techMap[t] || 0) + 1)));
  const tech = Object.entries(techMap).sort((a, b) => b[1] - a[1]);

  const head = (key: SortProps['sortBy'], label: string) => (
    <SortHead label={label} active={sortBy === key} reversed={sortReversed} onClick={() => onSort(key)} />
  );

  const projectLinks = (list: ProjectIdea[]) =>
    list.length === 0 ? (
      <span className="text-[var(--fg-3)] text-[12px]">None</span>
    ) : (
      list.map((p) => (
        <button key={p.id} onClick={() => onSelectProject(p)} className="list-link">
          <StatusDot status={p.status} className="w-[7px] h-[7px]" />
          {p.title}
        </button>
      ))
    );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>
            Analytics
            <span>{projects.length} projects</span>
          </h1>
          <p>Where every project stands and what it is built with.</p>
        </div>
        <div className="seg">
          {CHARTS.map(([id, label]) => (
            <button key={id} aria-pressed={chart === id} onClick={() => setChart(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span>Projects</span>
          <strong>{projects.length}</strong>
          <small>
            {count('in_progress')} active · {count('spike')} exploring
          </small>
        </div>
        <div className="stat">
          <span>Completion</span>
          <strong className="text-[var(--accent)]">{overall}%</strong>
          <small>
            {completedMilestones} of {totalMilestones} milestones
          </small>
        </div>
        <div className="stat">
          <span>Shipped</span>
          <strong style={{ color: DONE_COLOR }}>{shipped}</strong>
          <small>Released projects</small>
        </div>
        <div className="stat">
          <span>Technologies</span>
          <strong>{tech.length}</strong>
          <small className="truncate">{tech.slice(0, 3).map(([t]) => t).join(', ') || 'None yet'}</small>
        </div>
      </div>

      {chart === 'velocity' && (
        <section>
          <div className="section-head">
            <h3 className="inline-flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-[var(--accent)]" />
              Milestone progress
            </h3>
            <span className="flex gap-4 text-[12px]">
              {head('title', 'Project')}
              {head('status', 'Status')}
              {head('priority', 'Priority')}
              {head('progress', 'Done')}
            </span>
          </div>
          <div className="focus-grid mt-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} activity={activity[p.id]} compact onOpen={() => onSelectProject(p)} />
            ))}
          </div>
        </section>
      )}

      {chart === 'distribution' && (
        <>
          <section>
            <div className="section-head">
              <h3 className="inline-flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-[var(--accent)]" />
                By stage
              </h3>
            </div>
            <div className="focus-grid mt-3">
              {STATUS_ORDER.map((st) => {
                const matched = projects.filter((p) => p.status === st);
                return (
                  <div key={st} className="panel">
                    <div className="flex items-center gap-2 text-[12px] text-[var(--fg-3)]">
                      <StatusDot status={st} />
                      {STATUS_META[st].label}
                      <strong className="ml-auto text-[22px] font-medium text-[var(--fg)]">{matched.length}</strong>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">{projectLinks(matched)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="section-head">
              <h3 className="inline-flex items-center gap-2">
                <Flag className="h-3.5 w-3.5 text-[var(--accent)]" />
                By priority
              </h3>
            </div>
            <div className="focus-grid mt-3">
              {PRIORITY_ORDER.map((pr) => {
                const matched = projects.filter((p) => p.priority === pr);
                const tasks = matched.reduce((n, p) => n + p.milestones.length, 0);
                return (
                  <div key={pr} className="panel">
                    <div className="flex items-center gap-2 text-[12px] text-[var(--fg-3)]">
                      <span className={`pri-badge pri-${pr}`}>{PRIORITY_META[pr]}</span>
                      <span>{tasks} milestones</span>
                      <strong className="ml-auto text-[22px] font-medium text-[var(--fg)]">{matched.length}</strong>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">{projectLinks(matched)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {chart === 'tech' && (
        <section>
          <div className="section-head">
            <h3 className="inline-flex items-center gap-2">
              <Boxes className="h-3.5 w-3.5 text-[var(--accent)]" />
              Technology use
            </h3>
            <span className="hint">Projects per technology</span>
          </div>
          <div className="focus-grid mt-3">
            {tech.map(([name, n]) => {
              const pct = Math.round((n / Math.max(1, projects.length)) * 100);
              return (
                <div key={name} className="panel !py-3.5">
                  <div className="flex items-baseline justify-between text-[14px]">
                    <span className="truncate text-[var(--fg)]">{name}</span>
                    <span className="tabular-nums text-[var(--fg-3)] text-[12px]">
                      {n} · {pct}%
                    </span>
                  </div>
                  <ProgressBar pct={pct} className="mt-2" />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
