import React from 'react';
import type { 
  ProjectIdea, 
  ProjectStatus, 
  PriorityLevel 
} from '../types';
import { 
  ChevronRight, 
  FolderGit2, 
  ExternalLink
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
  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'P0':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            P0
          </span>
        );
      case 'P1':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
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
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'spike':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'planned':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'polishing':
        return 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'shipped':
        return 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-[var(--text-secondary)] bg-[var(--bg-page)] border-[var(--border-main)]';
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-main)] bg-[var(--bg-page)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-xs">
              <th className="py-3 px-4 font-medium">Priority</th>
              <th className="py-3 px-4 font-medium">Project</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Tech Stack</th>
              <th className="py-3 px-4 font-medium">Tasks</th>
              <th className="py-3 px-4 font-medium">Location</th>
              <th className="py-3 px-4 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-main)]">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[var(--text-muted)] italic text-sm">
                  No projects match your filter.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const completedMilestones = project.milestones.filter(m => m.completed).length;
                const totalMilestones = project.milestones.length;
                const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                return (
                  <tr
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer group"
                  >
                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(project.priority)}
                    </td>

                    {/* Title & subtitle */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--text-primary)] group-hover:underline text-sm">
                          {project.title}
                        </span>
                        <span className="text-[var(--text-secondary)] text-xs line-clamp-1 max-w-sm mt-0.5">
                          {project.subtitle}
                        </span>
                      </div>
                    </td>

                    {/* Status Select */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[var(--text-secondary)] font-mono text-xs bg-[var(--bg-page)] px-2.5 py-0.5 rounded border border-[var(--border-main)]">
                        {project.category}
                      </span>
                    </td>

                    {/* Tech stack */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-xs font-mono bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border-main)]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[var(--bg-page)] h-1.5 rounded-full overflow-hidden border border-[var(--border-main)]">
                          <div
                            className="h-full bg-[var(--text-primary)] rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[var(--text-secondary)]">
                          {completedMilestones}/{totalMilestones}
                        </span>
                      </div>
                    </td>

                    {/* Location / Repo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {project.path ? (
                        <div className="flex items-center gap-1.5 font-mono text-[var(--text-secondary)] text-xs">
                          <FolderGit2 className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[140px]" title={project.path}>{project.path.split(/[\/\\]/).pop()}</span>
                        </div>
                      ) : project.upstreamRefs && project.upstreamRefs.length > 0 ? (
                        <a
                          href={project.upstreamRefs[0].url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-xs font-mono"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]">{project.upstreamRefs[0].name}</span>
                        </a>
                      ) : (
                        <span className="text-[var(--text-muted)] italic font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Arrow */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectProject(project)}
                        className="p-1 rounded text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition"
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
