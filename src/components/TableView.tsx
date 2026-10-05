import React, { useState } from 'react';
import type { 
  ProjectIdea, 
  ProjectStatus, 
  PriorityLevel 
} from '../types';
import { 
  ChevronRight, 
  FolderGit2, 
  ExternalLink,
  Terminal,
  Copy,
  Check,
  CircleDot,
  CheckCircle2
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
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/25">
            P0
          </span>
        );
      case 'P1':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            P1
          </span>
        );
      case 'P2':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-medium text-[var(--text-secondary)] border border-[var(--border-main)]">
            P2
          </span>
        );
      case 'P3':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-medium text-[var(--text-muted)] border border-[var(--border-main)]">
            P3
          </span>
        );
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'in_progress':
        return 'text-emerald-500 dark:text-emerald-400 border-emerald-500/30';
      case 'spike':
        return 'text-amber-500 dark:text-amber-400 border-amber-500/30';
      case 'planned':
        return 'text-blue-500 dark:text-blue-400 border-blue-500/30';
      case 'polishing':
        return 'text-sky-500 dark:text-sky-400 border-sky-500/30';
      case 'shipped':
        return 'text-purple-500 dark:text-purple-400 border-purple-500/30';
      default:
        return 'text-[var(--text-secondary)] border-[var(--border-main)]';
    }
  };

  const formatShortDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-xs select-none">
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Priority</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Project</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Status</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Category</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Next Milestone</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Progress</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Tech Stack</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Dev Command</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Repository</th>
              <th className="py-3 px-3.5 font-medium whitespace-nowrap">Updated</th>
              <th className="py-3 px-3.5 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center text-[var(--text-muted)] italic text-sm">
                  No projects match your active search or filters.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const completedMilestones = project.milestones.filter(m => m.completed).length;
                const totalMilestones = project.milestones.length;
                const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
                const nextMilestone = project.milestones.find(m => !m.completed);
                const primaryCommand = project.commands && project.commands.length > 0 ? project.commands[0] : null;

                return (
                  <tr
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer group"
                  >
                    {/* Priority */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {getPriorityBadge(project.priority)}
                    </td>

                    {/* Title & subtitle */}
                    <td className="py-3.5 px-3.5 min-w-[200px]">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)] group-hover:underline text-sm tracking-tight">
                            {project.title}
                          </span>
                          {project.license && (
                            <span className="text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-main)] px-1.5 py-0.2 rounded">
                              {project.license}
                            </span>
                          )}
                        </div>
                        <span className="text-[var(--text-secondary)] text-xs line-clamp-1 max-w-sm mt-0.5">
                          {project.subtitle}
                        </span>
                      </div>
                    </td>

                    {/* Status Select */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={project.status}
                        onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
                        className={`text-xs font-mono py-1 px-2.5 rounded border focus:outline-none cursor-pointer bg-[var(--bg-surface)] ${getStatusBadge(
                          project.status
                        )}`}
                      >
                        <option value="backlog">Backlog</option>
                        <option value="planned">Planned</option>
                        <option value="spike">Spike</option>
                        <option value="in_progress">In Progress</option>
                        <option value="polishing">Polishing</option>
                        <option value="shipped">Shipped</option>
                      </select>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <span className="text-[var(--text-secondary)] font-mono text-xs bg-[var(--bg-surface)] px-2.5 py-0.5 rounded border border-[var(--border-main)]">
                        {project.category}
                      </span>
                    </td>

                    {/* Next Milestone */}
                    <td className="py-3.5 px-3.5 min-w-[210px] max-w-xs">
                      {nextMilestone ? (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono truncate" title={nextMilestone.text}>
                          <CircleDot className="h-3.5 w-3.5 text-amber-500/80 flex-shrink-0" />
                          <span className="truncate">{nextMilestone.text}</span>
                        </div>
                      ) : totalMilestones > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-500 dark:text-emerald-400 font-mono">
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>All {totalMilestones} done</span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)] italic font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[var(--border-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-main)]">
                          <div
                            className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          {completedMilestones}/{totalMilestones} ({progressPct}%)
                        </span>
                      </div>
                    </td>

                    {/* Tech stack */}
                    <td className="py-3.5 px-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-xs font-mono bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-main)] whitespace-nowrap"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Dev Command with 1-click copy */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {primaryCommand ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => copyToClipboard(e, primaryCommand.cmd, `cmd-${project.id}`)}
                            title={`Copy: ${primaryCommand.cmd}`}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-[var(--text-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs transition"
                          >
                            <Terminal className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{primaryCommand.cmd}</span>
                            {copiedId === `cmd-${project.id}` ? (
                              <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-60 flex-shrink-0" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)] italic font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Location / Repo with 1-click copy & external link */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        {project.path ? (
                          <button
                            onClick={(e) => copyToClipboard(e, project.path!, `path-${project.id}`)}
                            title={`Copy path: ${project.path}`}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-[var(--text-muted)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                          >
                            <FolderGit2 className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{project.path.split(/[/\\]/).pop()}</span>
                            {copiedId === `path-${project.id}` ? (
                              <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-60 flex-shrink-0" />
                            )}
                          </button>
                        ) : null}

                        {project.upstreamRefs && project.upstreamRefs.length > 0 && (
                          <a
                            href={project.upstreamRefs[0].url}
                            target="_blank"
                            rel="noreferrer"
                            title={project.upstreamRefs[0].name}
                            className="p-1 rounded border border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-[var(--text-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}

                        {!project.path && (!project.upstreamRefs || project.upstreamRefs.length === 0) && (
                          <span className="text-[var(--text-muted)] italic font-mono text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Updated */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap font-mono text-xs text-[var(--text-secondary)]">
                      {formatShortDate(project.updatedAt)}
                    </td>

                    {/* Arrow */}
                    <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectProject(project)}
                        className="p-1 rounded text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition"
                        title="Open details"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
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
