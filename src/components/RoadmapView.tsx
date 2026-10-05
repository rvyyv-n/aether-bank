import React from 'react';
import type { ProjectIdea } from '../types';
import { ArrowRight, Zap, Shield, Cpu, Globe } from 'lucide-react';

interface RoadmapViewProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
}

const PHASES = [
  {
    phase: 'Phase 1 \u00b7 Apps',
    target: 'Shipped',
    title: 'Voice & Habit Platforms',
    icon: Zap,
    projectIds: ['bookcook', 'rise'],
    description: 'Local-first family recipe vault with hands-free cooking mode, and frictionless block-based diet planner with weekly weigh-ins.'
  },
  {
    phase: 'Phase 2 \u00b7 Native',
    target: 'Exploring',
    title: 'High-Refresh Graphics & Low Latency',
    icon: Cpu,
    projectIds: ['aether', 'vulkan'],
    description: 'Direct3D 11 flip-model presentation, 360Hz clip review HUD with lossless trim, and legacy-hardware VulkanMod pipeline.'
  },
  {
    phase: 'Phase 3 \u00b7 CLI',
    target: 'Shipped',
    title: 'Terminal Engines & Foundations',
    icon: Globe,
    projectIds: ['catgen', 'learning-py'],
    description: 'Terminal-native ASCII art studio with Bubble Tea TUI, and comprehensive CS50 introduction to Python programming corpus.'
  },
  {
    phase: 'Phase 4 \u00b7 Tooling',
    target: 'Sprint Active',
    title: 'Local CRM, Sites & Agent Extensions',
    icon: Shield,
    projectIds: ['banker', 'rise-site', 'usage-limits-mod', 'portfolio-site'],
    description: 'Local-first project vault, zero-framework product marketing site, terminal agent telemetry hook, and terminal design tokens.'
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="space-y-4 max-w-7xl mx-auto sm:p-6">
      {/* Top Banner */}
      <div className="slop-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--fg)] m-0">Ecosystem Roadmap</h2>
          <p className="text-xs text-[var(--fg-2)] mt-0.5 m-0">Sequential execution across the open-source toolchain.</p>
        </div>
        <div className="text-xs font-mono text-[var(--fg-3)] bg-[var(--bg)] px-2.5 py-1 rounded border border-[var(--line)] self-start sm:self-auto">
          Local-First Architecture
        </div>
      </div>

      {/* Grid of Phase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {PHASES.map((p) => {
          const matchedProjects = projects.filter(item => p.projectIds.includes(item.id));
          const totalMilestones = matchedProjects.flatMap(m => m.milestones).length;
          const completedMilestones = matchedProjects.flatMap(m => m.milestones).filter(m => m.completed).length;
          const pct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
          const Icon = p.icon;

          return (
            <div
              key={p.phase}
              className="slop-card p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[var(--fg-3)] mb-2.5">
                  <span className="font-semibold text-[var(--fg)]">{p.phase}</span>
                  <span className="bg-[var(--bg)] px-1.5 py-0.2 rounded border border-[var(--line)] text-[10px]">
                    {p.target}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 my-3">
                  <div className="p-2 rounded-md bg-[var(--bg)] border border-[var(--line)] text-[var(--accent)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-[var(--fg)] tracking-tight m-0">
                    {p.title}
                  </h3>
                </div>

                <p className="text-[11px] text-[var(--fg-2)] leading-relaxed">
                  {p.description}
                </p>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-[var(--line)]">
                  <div className="flex justify-between text-[11px] font-mono text-[var(--fg-3)] mb-1.5">
                    <span>Progress</span>
                    <span>{pct}% ({completedMilestones}/{totalMilestones})</span>
                  </div>
                  <div className="slop-progress-track">
                    <div
                      className="slop-progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? '#a855f7' : 'var(--accent)',
                      }}
                    />
                  </div>
                </div>

                {/* Linked Projects */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-3)]">
                    Tracked:
                  </span>
                  {matchedProjects.map(proj => (
                    <div
                      key={proj.id}
                      onClick={() => onSelectProject(proj)}
                      className="p-2 rounded-md bg-[var(--bg)] hover:bg-[var(--hover)] border border-[var(--line)] hover:border-[var(--line-2)] cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                          {proj.title}
                        </span>
                        <span className="text-[10px] text-[var(--fg-3)] font-mono mt-0.5">
                          {proj.status.toUpperCase()} &middot; {proj.priority}
                        </span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-[var(--fg-3)] group-hover:text-[var(--fg)] transition" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
