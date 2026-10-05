import React from 'react';
import type { ProjectIdea } from '../types';
import { ArrowRight, Zap, Shield, Cpu, Globe } from 'lucide-react';

interface RoadmapViewProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
}

const PHASES = [
  {
    phase: 'Phase 1 · Apps',
    target: 'Shipped',
    title: 'Voice & Habit Platforms',
    icon: Zap,
    projectIds: ['bookcook', 'rise'],
    description: 'Local-first family recipe vault with hands-free cooking mode, and frictionless block-based diet planner with weekly weigh-ins.'
  },
  {
    phase: 'Phase 2 · Native',
    target: 'Active Spike',
    title: 'High-Refresh Graphics & Low Latency',
    icon: Cpu,
    projectIds: ['aether', 'vulkan'],
    description: 'Direct3D 11 flip-model presentation, 360Hz clip review HUD with lossless trim, and legacy-hardware VulkanMod pipeline.'
  },
  {
    phase: 'Phase 3 · CLI',
    target: 'Shipped',
    title: 'Terminal Engines & Foundations',
    icon: Globe,
    projectIds: ['catgen', 'learning-py'],
    description: 'Terminal-native ASCII art studio with Bubble Tea TUI, and comprehensive CS50 introduction to Python programming corpus.'
  },
  {
    phase: 'Phase 4 · Tooling',
    target: 'Sprint Active',
    title: 'Local CRM, Sites & Agent Extensions',
    icon: Shield,
    projectIds: ['banker', 'rise-site', 'usage-limits-mod', 'portfolio-site'],
    description: 'Local-first project vault, zero-framework product marketing site, terminal agent telemetry hook, and terminal design tokens.'
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] m-0">Ecosystem Roadmap</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 m-0">Sequential execution across the open-source toolchain.</p>
        </div>
        <div className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-page)] px-2.5 py-1 rounded border border-[var(--border-main)]">
          Zero-Cost Infrastructure
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {PHASES.map((p) => {
          const matchedProjects = projects.filter(item => p.projectIds.includes(item.id));
          const totalMilestones = matchedProjects.flatMap(m => m.milestones).length;
          const completedMilestones = matchedProjects.flatMap(m => m.milestones).filter(m => m.completed).length;
          const pct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
          const Icon = p.icon;

          return (
            <div
              key={p.phase}
              className="oled-card rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] mb-2">
                  <span className="font-semibold text-[var(--text-primary)]">{p.phase}</span>
                  <span className="bg-[var(--bg-page)] px-1.5 py-0.5 rounded border border-[var(--border-main)]">{p.target}</span>
                </div>

                <div className="flex items-center gap-2 my-2.5">
                  <div className="p-1.5 rounded-md bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-primary)]">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)] tracking-tight m-0">
                    {p.title}
                  </h3>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {p.description}
                </p>

                {/* Progress bar */}
                <div className="mt-3.5 pt-2.5 border-t border-[var(--border-main)]">
                  <div className="flex justify-between text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                    <span>Progress</span>
                    <span>{pct}% ({completedMilestones}/{totalMilestones})</span>
                  </div>
                  <div className="w-full bg-[var(--bg-page)] h-1 rounded-full overflow-hidden border border-[var(--border-main)]">
                    <div className="h-full bg-[var(--text-primary)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Linked Projects */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Tracked:</span>
                  {matchedProjects.map(proj => (
                    <div
                      key={proj.id}
                      onClick={() => onSelectProject(proj)}
                      className="p-2 rounded-lg bg-[var(--bg-page)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-[var(--text-primary)] group-hover:underline">
                          {proj.title}
                        </span>
                        <span className="text-[9px] text-[var(--text-secondary)] font-mono">
                          {proj.status.toUpperCase()} · {proj.priority}
                        </span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition" />
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
