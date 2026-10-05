import React, { useState } from 'react';
import type { 
  ProjectIdea, 
  ProjectStatus, 
  PriorityLevel 
} from '../types';
import { 
  Terminal,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';

interface TableViewProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  projects,
  onSelectProject,
  onUpdateStatus,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'P0':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
            P0
          </span>
        );
      case 'P1':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25">
            P1
          </span>
        );
      case 'P2':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium text-[var(--fg-2)] border border-[var(--line)]">
            P2
          </span>
        );
      case 'P3':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium text-[var(--fg-3)] border border-[var(--line)]">
            P3
          </span>
        );
    }
  };

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

  const formatShortDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--fg-3)] font-mono uppercase tracking-wider text-[11px] select-none">
              <th className="py-2.5 px-3.5 font-medium whitespace-nowrap">Priority</th>
              <th className="py-2.5 px-3.5 font-medium whitespace-nowrap">Project</th>
              <th className="py-2.5 px-3.5 font-medium whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3.5 font-medium whitespace-nowrap">Milestones</th>
              <th className="py-2.5 px-3.5 font-medium whitespace-nowrap">Tech Stack</th>
              <th className="py-2.5 px-3.5 font-medium whitespace-nowrap">Dev Command</th>
              <th className="py-2.5 px-3.5 font-medium whitespace-nowrap">Updated</th>
              <th className="py-2.5 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] font-normal">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[var(--fg-3)] font-mono">
                  No projects matching active filters.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const completed = project.milestones.filter((m) => m.completed).length;
                const total = project.milestones.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const primaryCommand =
                  project.commands && project.commands.length > 0
                    ? project.commands[0]
                    : null;

                return (
                  <tr
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="hover:bg-[var(--hover)] transition-colors cursor-pointer group"
                  >
                    {/* Priority */}
                    <td className="py-3 px-3.5 whitespace-nowrap align-middle">
                      {getPriorityBadge(project.priority)}
                    </td>

                    {/* Title & Category */}
                    <td className="py-3 px-3.5 align-middle min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                          {project.title}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--fg-3)] border border-[var(--line)] px-1 py-0.2 rounded">
                          {project.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--fg-2)] truncate max-w-sm mt-0.5">
                        {project.subtitle}
                      </div>
                    </td>

                    {/* Status with dot */}
                    <td className="py-3 px-3.5 whitespace-nowrap align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getStatusColor(project.status) }}
                        />
                        <select
                          value={project.status}
                          onChange={(e) =>
                            onUpdateStatus(project.id, e.target.value as ProjectStatus)
                          }
                          className="bg-[var(--bg)] border border-[var(--line)] rounded px-2 py-1 text-xs text-[var(--fg)] cursor-pointer focus:outline-none focus:border-[var(--accent)]"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="planned">Planned</option>
                          <option value="spike">Spike & R&D</option>
                          <option value="in_progress">In Progress</option>
                          <option value="polishing">Polishing</option>
                          <option value="shipped">Shipped</option>
                        </select>
                      </div>
                    </td>

                    {/* Milestones Progress */}
                    <td className="py-3 px-3.5 align-middle min-w-[150px]">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--fg-3)] mb-1">
                        <span>{completed}/{total}</span>
                        <span>{pct}%</span>
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
                    </td>

                    {/* Tech Stack */}
                    <td className="py-3 px-3.5 align-middle">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[var(--bg)] text-[var(--fg-2)] border border-[var(--line)]"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="px-1 py-0.2 rounded text-[10px] font-mono text-[var(--fg-3)] border border-[var(--line)]">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dev Command */}
                    <td className="py-3 px-3.5 whitespace-nowrap align-middle" onClick={(e) => e.stopPropagation()}>
                      {primaryCommand ? (
                        <button
                          onClick={(e) =>
                            copyToClipboard(
                              e,
                              primaryCommand.cmd,
                              `tbl-cmd-${project.id}`
                            )
                          }
                          className="flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--line)] hover:border-[var(--line-2)] font-mono text-[11px] text-[var(--fg-2)] hover:text-[var(--fg)] bg-[var(--bg)] transition cursor-pointer"
                          title={`Copy: ${primaryCommand.cmd}`}
                        >
                          <Terminal className="h-3 w-3 opacity-60" />
                          <span className="truncate max-w-[120px]">{primaryCommand.cmd}</span>
                          {copiedId === `tbl-cmd-${project.id}` ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : project.path ? (
                        <span className="text-[11px] font-mono text-[var(--fg-3)] truncate max-w-[120px] block">
                          {project.path.split(/[/\\\\]/).pop()}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[var(--fg-3)]">&mdash;</span>
                      )}
                    </td>

                    {/* Updated */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-[var(--fg-3)] align-middle">
                      {formatShortDate(project.updatedAt)}
                    </td>

                    {/* Chevron */}
                    <td className="py-3 px-2 text-right align-middle">
                      <ChevronRight className="h-3.5 w-3.5 text-[var(--fg-3)] group-hover:text-[var(--fg)] group-hover:translate-x-0.5 transition-all inline-block" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
