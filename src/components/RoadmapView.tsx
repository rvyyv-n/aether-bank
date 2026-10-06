import React from 'react';
import type { ProjectIdea } from '../types';
import { StatusDot, PriorityBadge, ProgressBar } from './ui';
import { STATUS_META } from '../data/status';

interface RoadmapViewProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
}

const PHASES = [
  {
    phase: 'Phase 1 \u00b7 Apps',
    target: 'Shipped',
    title: 'Voice & Habit Platforms',
    projectIds: ['bookcook', 'rise'],
    description: 'Local-first family recipe vault with hands-free cooking mode, and frictionless block-based diet planner with weekly weigh-ins.'
  },
  {
    phase: 'Phase 2 \u00b7 Native',
    target: 'Exploring',
    title: 'High-Refresh Graphics & Low Latency',
    projectIds: ['aether', 'vulkan'],
    description: 'Direct3D 11 flip-model presentation, 360Hz clip review HUD with lossless trim, and legacy-hardware VulkanMod pipeline.'
  },
  {
    phase: 'Phase 3 \u00b7 CLI',
    target: 'Shipped',
    title: 'Terminal Engines & Foundations',
    projectIds: ['catgen', 'learning-py'],
    description: 'Terminal-native ASCII art studio with Bubble Tea TUI, and comprehensive CS50 introduction to Python programming corpus.'
  },
  {
    phase: 'Phase 4 \u00b7 Tooling',
    target: 'Sprint Active',
    title: 'Local CRM, Sites & Agent Extensions',
    projectIds: ['banker', 'rise-site', 'usage-limits-mod', 'portfolio-site'],
    description: 'Local-first project vault, zero-framework product marketing site, terminal agent telemetry hook, and terminal design tokens.'
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({ projects, onSelectProject }) => (
  <div className="page">
    <div className="page-head">
      <div>
        <h1>
          Roadmap
          <span>{PHASES.length} phases</span>
        </h1>
        <p>Sequential execution across the toolchain.</p>
      </div>
    </div>

    {PHASES.map((p, i) => {
      const matched = projects.filter((item) => p.projectIds.includes(item.id));
      const milestones = matched.flatMap((m) => m.milestones);
      const done = milestones.filter((m) => m.completed).length;
      const pct = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0;

      return (
        <section key={p.phase}>
          <div className="section-head">
            <h3>
              {p.phase}
              <span className="text-[var(--fg-3)] font-normal"> &middot; {p.title}</span>
            </h3>
            <span className="hint">
              {p.target} &middot; {pct}% ({done}/{milestones.length})
            </span>
          </div>
          <p className="side-note mt-1 mb-2">{p.description}</p>
          <ProgressBar pct={pct} />
          <div className="mt-2">
            {matched.map((proj) => {
              const d = proj.milestones.filter((m) => m.completed).length;
              return (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className="rank-row w-full text-left cursor-pointer hover:bg-[var(--hover)]"
                >
                  <span className="num">{i + 1}</span>
                  <span className="min-w-0 flex items-center gap-2">
                    <StatusDot status={proj.status} />
                    <span className="truncate">{proj.title}</span>
                    <PriorityBadge priority={proj.priority} />
                  </span>
                  <span className="hide-phone val text-[var(--fg-3)]">{STATUS_META[proj.status].label}</span>
                  <span className="val">
                    {d}/{proj.milestones.length}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      );
    })}
  </div>
);
