import React from 'react';
import type { 
  ProjectIdea, 
  ProjectStatus, 
  PriorityLevel 
} from '../types';
import { 
  ChevronRight, 
  FolderGit2, 
  Flame, 
  AlertTriangle,
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
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
            <Flame className="h-3 w-3" /> P0 Urgent
          </span>
        );
      case 'P1':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1 w-fit">
            <AlertTriangle className="h-3 w-3" /> P1 High
          </span>
        );
      case 'P2':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
            P2 Medium
          </span>
        );
      case 'P3':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 w-fit">
            P3 Low
          </span>
        );
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'in_progress':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'spike':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'planned':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'polishing':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'shipped':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/60 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-zinc-900/60 text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Tech Stack</th>
              <th className="py-3 px-4">Milestones</th>
              <th className="py-3 px-4">Location / Upstream</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-500 italic">
                  No projects match your filter query.
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
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(project.priority)}
                    </td>

                    {/* Title & subtitle */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors text-sm">
                          {project.title}
                        </span>
                        <span className="text-zinc-400 text-xs line-clamp-1 max-w-sm mt-0.5">
                          {project.subtitle}
                        </span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={project.status}
                        onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
                        className={`text-xs font-medium py-1 px-2.5 rounded-md border focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer ${getStatusColor(
                          project.status
                        )}`}
                      >
                        <option value="backlog">Backlog</option>
                        <option value="planned">Planned</option>
                        <option value="spike">Spike / R&D</option>
                        <option value="in_progress">In Progress</option>
                        <option value="polishing">Polishing</option>
                        <option value="shipped">Shipped</option>
                      </select>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-zinc-300 font-mono text-[11px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {project.category}
                      </span>
                    </td>

                    {/* Tech stack */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800/80"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">
                          {completedMilestones}/{totalMilestones}
                        </span>
                      </div>
                    </td>

                    {/* Location / Repo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {project.path ? (
                        <div className="flex items-center gap-1.5 font-mono text-cyan-400/90 text-xs">
                          <FolderGit2 className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="truncate max-w-[140px]" title={project.path}>{project.path.split('\\').pop()}</span>
                        </div>
                      ) : project.upstreamRefs && project.upstreamRefs.length > 0 ? (
                        <a
                          href={project.upstreamRefs[0].url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-zinc-400 hover:text-white transition"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{project.upstreamRefs[0].name}</span>
                        </a>
                      ) : (
                        <span className="text-zinc-600 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectProject(project)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 group-hover:text-cyan-400 transition"
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
