import React from 'react';
import type { ProjectIdea } from '../types';
import { ArrowRight, Zap, Shield, Cpu, Globe } from 'lucide-react';

interface RoadmapViewProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
}

const PHASES = [
  {
    phase: 'Phase 1 · Immediate Core',
    target: 'Today / Morning Run',
    title: 'Aether Debloater & Fluent Mica Shell',
    icon: Zap,
    color: 'from-cyan-500 to-blue-500',
    projectIds: ['aether', 'fluent-ui-kit'],
    description: 'Autonomous build of Aether core in Rust with mocked dry-run safety, Tauri v2 Mica translucent window shell, and reversible tweaks.'
  },
  {
    phase: 'Phase 2 · Input Hardware',
    target: 'Next Sprint',
    title: 'OpenMouse Companion & Peripherals',
    icon: Cpu,
    color: 'from-amber-500 to-orange-500',
    projectIds: ['peripheral-tool'],
    description: 'Hardware configuration tool without kernel drivers. Adopts OpenMouse WebHID / HID++ 2.0 protocol layer for Logitech and Wooting peripherals.'
  },
  {
    phase: 'Phase 3 · Browser & Showcase',
    target: 'Following Sprint',
    title: 'Aether Browser Spike & Distribution Site',
    icon: Globe,
    color: 'from-indigo-500 to-purple-500',
    projectIds: ['minimal-browser', 'showcase-website'],
    description: 'Weekend spike of multi-webview shell in Tauri v2 + Brave adblock-rust. Companion Astro landing page showcasing the suite with live GitHub releases.'
  },
  {
    phase: 'Phase 4 · Release Automation',
    target: 'Production Ready',
    title: 'Zero-Dollar CI/CD & Free Code Signing',
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
    projectIds: ['zero-dollar-pipeline'],
    description: 'SignPath Foundation free open-source code signing to eliminate SmartScreen warnings, multi-architecture GitHub Actions, and winget publishing.'
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl mica-surface border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white m-0">Ecosystem Roadmap & Delivery Milestones</h2>
          <p className="text-xs text-zinc-400 mt-1 m-0">Sequential execution strategy minimizing rebuild fatigue and maximizing shared UI leverage.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30">
          <span>Target Budget: $0.00</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PHASES.map((p) => {
          const matchedProjects = projects.filter(item => p.projectIds.includes(item.id));
          const totalMilestones = matchedProjects.flatMap(m => m.milestones).length;
          const completedMilestones = matchedProjects.flatMap(m => m.milestones).filter(m => m.completed).length;
          const pct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
          const Icon = p.icon;

          return (
            <div
              key={p.phase}
              className="mica-card rounded-xl p-4 border border-white/[0.08] flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.color}" />
              
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
                  <span className="text-cyan-400 font-semibold">{p.phase}</span>
                  <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{p.target}</span>
                </div>

                <div className="flex items-center gap-2.5 my-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${p.color} text-white shadow-md`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight m-0">
                    {p.title}
                  </h3>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {p.description}
                </p>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                    <span>Phase Completion</span>
                    <span>{pct}% ({completedMilestones}/{totalMilestones})</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Linked Projects */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Tracked Projects:</span>
                  {matchedProjects.map(proj => (
                    <div
                      key={proj.id}
                      onClick={() => onSelectProject(proj)}
                      className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white group-hover:text-cyan-400 transition">
                          {proj.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {proj.status.toUpperCase()} · {proj.priority}
                        </span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-cyan-400 transition" />
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
