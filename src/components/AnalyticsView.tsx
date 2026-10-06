import React, { useState } from 'react';
import type { ProjectIdea, PriorityLevel } from '../types';
import { StatusDot, PriorityBadge, ProgressBar } from './ui';
import { STATUS_ORDER, STATUS_META, DONE_COLOR } from '../data/status';

interface AnalyticsViewProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
}

type Chart = 'velocity' | 'distribution' | 'tech';

const CHARTS: [Chart, string][] = [
  ['velocity', 'Progress'],
  ['distribution', 'Stages'],
  ['tech', 'Stack'],
];

const PRIORITIES: PriorityLevel[] = ['P0', 'P1', 'P2', 'P3'];

const doneCount = (p: ProjectIdea) => p.milestones.filter((m) => m.completed).length;

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ projects, onSelectProject }) => {
  const [chart, setChart] = useState<Chart>('velocity');

  const totalMilestones = projects.reduce((n, p) => n + p.milestones.length, 0);
  const completedMilestones = projects.reduce((n, p) => n + doneCount(p), 0);
  const overall = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const count = (status: ProjectIdea['status']) => projects.filter((p) => p.status === status).length;
  const shipped = count('shipped');

  const techMap: Record<string, number> = {};
  projects.forEach((p) => p.techStack.forEach((t) => (techMap[t] = (techMap[t] || 0) + 1)));
  const tech = Object.entries(techMap).sort((a, b) => b[1] - a[1]);

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
          <small className="truncate">
            {tech.slice(0, 3).map(([t]) => t).join(', ') || 'None yet'}
          </small>
        </div>
      </div>

      {chart === 'velocity' && (
        <section>
          <div className="section-head">
            <h3>Milestone progress</h3>
            <span className="hint">Open a project from its row</span>
          </div>
          <div className="mt-2">
            {projects.map((p, i) => {
              const done = doneCount(p);
              const total = p.milestones.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="rank-row w-full text-left cursor-pointer hover:bg-[var(--hover)]"
                >
                  <span className="num">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <StatusDot status={p.status} />
                      <span className="truncate">{p.title}</span>
                      <PriorityBadge priority={p.priority} />
                    </span>
                    <ProgressBar pct={pct} className="mt-1.5 max-w-md" />
                  </span>
                  <span className="val">
                    {pct}%<small>{done}/{total}</small>
                  </span>
                  <span className="hide-phone val text-[var(--fg-3)]">{p.category}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {chart === 'distribution' && (
        <>
          <section>
            <div className="section-head">
              <h3>By stage</h3>
            </div>
            <div className="stats mt-3">
              {STATUS_ORDER.map((st) => {
                const matched = projects.filter((p) => p.status === st);
                return (
                  <div key={st} className="stat">
                    <span className="flex items-center gap-1.5">
                      <StatusDot status={st} />
                      {STATUS_META[st].label}
                    </span>
                    <strong>{matched.length}</strong>
                    <small className="truncate">{matched.map((p) => p.title).join(', ') || 'None'}</small>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="section-head">
              <h3>By priority</h3>
            </div>
            <div className="stats mt-3">
              {PRIORITIES.map((pr) => {
                const matched = projects.filter((p) => p.priority === pr);
                const tasks = matched.reduce((n, p) => n + p.milestones.length, 0);
                return (
                  <div key={pr} className="stat">
                    <span>{pr}</span>
                    <strong>{matched.length}</strong>
                    <small>
                      {tasks} milestones
                    </small>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {matched.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onSelectProject(p)}
                          className="text-button text-[12px]"
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
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
            <h3>Technology use</h3>
            <span className="hint">Projects per technology</span>
          </div>
          <div className="mt-2">
            {tech.map(([name, n], i) => {
              const pct = Math.round((n / projects.length) * 100);
              return (
                <div key={name} className="rank-row">
                  <span className="num">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate">{name}</span>
                    <ProgressBar pct={pct} className="mt-1.5" />
                  </span>
                  <span className="val">
                    {n}
                    <small>{pct}%</small>
                  </span>
                  <span />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
