import React from 'react';
import type { ProjectIdea } from '../types';
import { Layers } from 'lucide-react';
import { ProgressBar } from './ui';
import { ProjectCard } from './ProjectCard';
import type { ActivityMap } from '../data/repos';

interface RoadmapViewProps {
  projects: ProjectIdea[];
  activity: ActivityMap;
  onSelectProject: (project: ProjectIdea) => void;
}

const PHASES = [
  {
    phase: 'Phase 1',
    name: 'Apps',
    target: 'Shipped',
    title: 'Voice & Habit Platforms',
    projectIds: ['bookcook', 'rise'],
    description: 'Local-first family recipe vault with hands-free cooking mode, and frictionless block-based diet planner with weekly weigh-ins.'
  },
  {
    phase: 'Phase 2',
    name: 'Native',
    target: 'Exploring',
    title: 'High-Refresh Graphics & Low Latency',
    projectIds: ['aether', 'vulkan'],
    description: 'Direct3D 11 flip-model presentation, 360Hz clip review HUD with lossless trim, and legacy-hardware VulkanMod pipeline.'
  },
  {
    phase: 'Phase 3',
    name: 'CLI',
    target: 'Shipped',
    title: 'Terminal Engines & Foundations',
    projectIds: ['catgen', 'learning-py'],
    description: 'Terminal-native ASCII art studio with Bubble Tea TUI, and comprehensive CS50 introduction to Python programming corpus.'
  },
  {
    phase: 'Phase 4',
    name: 'Tooling',
    target: 'Sprint Active',
    title: 'Local CRM, Sites & Agent Extensions',
    projectIds: ['banker', 'rise-site', 'usage-limits-mod', 'portfolio-site'],
    description: 'Local-first project vault, zero-framework product marketing site, terminal agent telemetry hook, and terminal design tokens.'
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({ projects, activity, onSelectProject }) => (
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

    {PHASES.map((p) => {
      const matched = projects.filter((item) => p.projectIds.includes(item.id));
      const milestones = matched.flatMap((m) => m.milestones);
      const done = milestones.filter((m) => m.completed).length;
      const pct = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0;

      return (
        <section key={p.phase}>
          <div className="section-head">
            <h3 className="inline-flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[var(--accent)]" />
              {p.phase}
              <span className="text-[var(--fg-3)] font-normal">
                &middot; {p.name} &middot; {p.title}
              </span>
            </h3>
            <span className="hint">
              {p.target} &middot; {pct}% ({done}/{milestones.length})
            </span>
          </div>
          <p className="side-note mt-1 mb-2">{p.description}</p>
          <ProgressBar pct={pct} />
          {matched.length === 0 ? (
            <p className="side-note mt-3">No projects in this phase match the filters.</p>
          ) : (
            <div className="focus-grid mt-3">
              {matched.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  activity={activity[proj.id]}
                  compact
                  onOpen={() => onSelectProject(proj)}
                />
              ))}
            </div>
          )}
        </section>
      );
    })}
  </div>
);
