import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';
import { 
  TrendingUp 
} from 'lucide-react';

interface AnalyticsViewProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ projects, onSelectProject }) => {
  const [activeChart, setActiveChart] = useState<'velocity' | 'distribution' | 'tech'>('velocity');
  const [hoveredProject, setHoveredProject] = useState<ProjectIdea | null>(null);

  // Compute metrics
  const totalProjects = projects.length;
  const totalMilestones = projects.reduce((acc, p) => acc + p.milestones.length, 0);
  const completedMilestones = projects.reduce(
    (acc, p) => acc + p.milestones.filter((m) => m.completed).length,
    0
  );
  const overallProgress = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;

  const shippedCount = projects.filter((p) => p.status === 'shipped').length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const spikeCount = projects.filter((p) => p.status === 'spike').length;

  // Tech stack counts
  const techMap: Record<string, number> = {};
  projects.forEach((p) => {
    p.techStack.forEach((t) => {
      techMap[t] = (techMap[t] || 0) + 1;
    });
  });
  const sortedTech = Object.entries(techMap).sort((a, b) => b[1] - a[1]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'in_progress':
        return '#10b981';
      case 'spike':
        return '#f59e0b';
      case 'planned':
        return '#3b82f6';
      case 'polishing':
        return '#0ea5e9';
      case 'shipped':
        return '#a855f7';
      case 'backlog':
      default:
        return '#71717a';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Metric Cards (Slopalytics minimalist cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="slop-card p-4">
          <div className="text-[11px] font-mono text-[var(--fg-3)] uppercase tracking-wider">
            Total Projects
          </div>
          <div className="text-2xl font-semibold mt-1 tracking-tight text-[var(--fg)]">
            {totalProjects}
          </div>
          <div className="text-xs text-[var(--fg-2)] mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{inProgressCount} active &middot; {spikeCount} exploring</span>
          </div>
        </div>

        <div className="slop-card p-4">
          <div className="text-[11px] font-mono text-[var(--fg-3)] uppercase tracking-wider">
            Overall Completion
          </div>
          <div className="text-2xl font-semibold mt-1 tracking-tight text-[var(--accent)]">
            {overallProgress}%
          </div>
          <div className="text-xs text-[var(--fg-2)] mt-1">
            {completedMilestones} of {totalMilestones} milestones
          </div>
        </div>

        <div className="slop-card p-4">
          <div className="text-[11px] font-mono text-[var(--fg-3)] uppercase tracking-wider">
            Shipped Products
          </div>
          <div className="text-2xl font-semibold mt-1 tracking-tight text-purple-400">
            {shippedCount}
          </div>
          <div className="text-xs text-[var(--fg-2)] mt-1">
            Production & community releases
          </div>
        </div>

        <div className="slop-card p-4">
          <div className="text-[11px] font-mono text-[var(--fg-3)] uppercase tracking-wider">
            Tech Ecosystem
          </div>
          <div className="text-2xl font-semibold mt-1 tracking-tight text-[var(--fg)]">
            {sortedTech.length}
          </div>
          <div className="text-xs text-[var(--fg-2)] mt-1 truncate">
            Top: {sortedTech.slice(0, 3).map((t) => t[0]).join(', ')}
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="slop-card p-6">
        {/* Chart Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[var(--line)] gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--fg)] m-0 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
              <span>Vault Analytics & Execution Velocity</span>
            </h2>
            <p className="text-xs text-[var(--fg-2)] mt-0.5 m-0">
              Interactive project completion benchmarks and architectural footprint.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] self-start sm:self-auto">
            <button
              onClick={() => setActiveChart('velocity')}
              className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                activeChart === 'velocity'
                  ? 'bg-[var(--fg)] text-[var(--bg)] font-semibold'
                  : 'text-[var(--fg-2)] hover:text-[var(--fg)]'
              }`}
            >
              Velocity
            </button>
            <button
              onClick={() => setActiveChart('distribution')}
              className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                activeChart === 'distribution'
                  ? 'bg-[var(--fg)] text-[var(--bg)] font-semibold'
                  : 'text-[var(--fg-2)] hover:text-[var(--fg)]'
              }`}
            >
              Stage Matrix
            </button>
            <button
              onClick={() => setActiveChart('tech')}
              className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                activeChart === 'tech'
                  ? 'bg-[var(--fg)] text-[var(--bg)] font-semibold'
                  : 'text-[var(--fg-2)] hover:text-[var(--fg)]'
              }`}
            >
              Stack
            </button>
          </div>
        </div>

        {/* Chart 1: Velocity & Milestones Progress Bar Chart */}
        {activeChart === 'velocity' && (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--fg-3)]">
              <span>PROJECT / MILESTONES RATIO</span>
              <span>COMPLETION RATE</span>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => {
                const completed = proj.milestones.filter((m) => m.completed).length;
                const total = proj.milestones.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const isHovered = hoveredProject?.id === proj.id;

                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj)}
                    onMouseEnter={() => setHoveredProject(proj)}
                    onMouseLeave={() => setHoveredProject(null)}
                    className={`p-3 rounded-lg border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isHovered
                        ? 'border-[var(--line-2)] bg-[var(--hover)]'
                        : 'border-[var(--line)] bg-[var(--surface)]'
                    }`}
                  >
                    <div className="min-w-[200px] flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getStatusColor(proj.status) }}
                        />
                        <span className="font-medium text-xs text-[var(--fg)]">
                          {proj.title}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--fg-3)] border border-[var(--line)] px-1.5 py-0.2 rounded">
                          {proj.priority}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--fg-3)]">
                          {proj.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--fg-2)] mt-1 truncate">
                        {proj.subtitle}
                      </p>
                    </div>

                    <div className="w-full sm:w-64 flex items-center gap-3">
                      <div className="flex-1 slop-progress-track h-2">
                        <div
                          className="slop-progress-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct === 100 ? '#a855f7' : 'var(--accent)',
                          }}
                        />
                      </div>
                      <div className="w-16 text-right font-mono text-xs text-[var(--fg)] font-medium">
                        {pct}%
                      </div>
                      <div className="w-12 text-right font-mono text-[11px] text-[var(--fg-3)]">
                        {completed}/{total}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart 2: Distribution by Status & Priority */}
        {activeChart === 'distribution' && (
          <div className="pt-6 space-y-6">
            <div>
              <div className="text-xs font-mono text-[var(--fg-3)] mb-3">
                LIFECYCLE PIPELINE BREAKDOWN
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {(['backlog', 'planned', 'spike', 'in_progress', 'polishing', 'shipped'] as ProjectStatus[]).map(
                  (st) => {
                    const matched = projects.filter((p) => p.status === st);
                    return (
                      <div
                        key={st}
                        className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] flex flex-col justify-between min-h-[90px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getStatusColor(st) }}
                          />
                          <span className="text-xs font-medium text-[var(--fg)] capitalize">
                            {st.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-2 text-xl font-bold font-mono text-[var(--fg)]">
                          {matched.length}
                        </div>
                        <div className="text-[10px] text-[var(--fg-3)] truncate">
                          {matched.map((p) => p.title).join(', ') || 'No projects'}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-[var(--fg-3)] mb-3">
                PRIORITY WEIGHT DISTRIBUTION
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['P0', 'P1', 'P2', 'P3'] as PriorityLevel[]).map((pr) => {
                  const matched = projects.filter((p) => p.priority === pr);
                  const totalMilestonesInPr = matched.reduce((a, b) => a + b.milestones.length, 0);
                  return (
                    <div
                      key={pr}
                      className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[var(--accent)]">
                          {pr}
                        </span>
                        <span className="text-xs font-mono text-[var(--fg-3)]">
                          {matched.length} projects
                        </span>
                      </div>
                      <div className="mt-2 font-mono text-lg font-semibold text-[var(--fg)]">
                        {totalMilestonesInPr} <span className="text-xs text-[var(--fg-3)] font-normal">tasks</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {matched.map((p) => (
                          <span
                            key={p.id}
                            onClick={() => onSelectProject(p)}
                            className="text-[10px] font-mono text-[var(--fg-2)] hover:text-[var(--fg)] bg-[var(--hover)] px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            {p.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chart 3: Tech Stack Frequency */}
        {activeChart === 'tech' && (
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--fg-3)]">
              <span>TECHNOLOGY / FRAMEWORK</span>
              <span>PROJECT OCCURRENCE</span>
            </div>
            {sortedTech.map(([tech, count]) => {
              const pct = Math.round((count / totalProjects) * 100);
              return (
                <div
                  key={tech}
                  className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4"
                >
                  <div className="w-40 font-mono text-xs font-medium text-[var(--fg)] truncate">
                    {tech}
                  </div>
                  <div className="flex-1 slop-progress-track">
                    <div
                      className="slop-progress-fill"
                      style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
                    />
                  </div>
                  <div className="w-20 text-right font-mono text-xs text-[var(--fg-2)]">
                    {count} {count === 1 ? 'project' : 'projects'} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
