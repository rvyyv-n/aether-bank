import React from 'react';
import type { ProjectIdea } from '../types';
import { ArrowRight, Zap, Shield, Cpu, Globe } from 'lucide-react';

interface RoadmapViewProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
}

const PHASES = [
  {
    phase: 'Phase 1 · Core',
    target: 'Sprint 1',
    title: 'Aether Debloater & Shell',
    icon: Zap,
    projectIds: ['aether', 'fluent-ui-kit'],
    description: 'Autonomous build of Aether core in Rust with mocked dry-run safety, Tauri v2 Mica translucent window shell, and reversible tweaks.'
  },
  {
    phase: 'Phase 2 · Input',
    target: 'Sprint 2',
    title: 'Peripheral Configurator',
    icon: Cpu,
    projectIds: ['peripheral-tool'],
    description: 'Hardware configuration tool without kernel drivers. Adopts OpenMouse WebHID / HID++ 2.0 protocol layer for Logitech and Wooting peripherals.'
  },
  {
    phase: 'Phase 3 · Web',
    target: 'Sprint 3',
    title: 'Minimal Browser & Site',
    icon: Globe,
    projectIds: ['minimal-browser', 'showcase-website'],
    description: 'Weekend spike of multi-webview shell in Tauri v2 + Brave adblock-rust. Companion Astro landing page showcasing the suite with live GitHub releases.'
  },
  {
    phase: 'Phase 4 · Release',
    target: 'Production',
    title: 'Zero-Dollar CI/CD & Signing',
    icon: Shield,
    projectIds: ['zero-dollar-pipeline'],
    description: 'SignPath Foundation free open-source code signing to eliminate SmartScreen warnings, multi-architecture GitHub Actions, and winget publishing.'
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] m-0">Ecosystem Roadmap</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 m-0">Execution sequence across the open-source Windows suite.</p>
        </div>
        <div className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-page)] px-2.5 py-1 rounded border border-[var(--border-main)]">
          Target: $0.00 Infra Cost
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
