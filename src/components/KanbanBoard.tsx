import React from 'react';
import type { 
  ProjectIdea, 
  ProjectStatus, 
  PriorityLevel 
} from '../types';
import { 
  FolderGit2, 
  ArrowRight, 
  ArrowLeft, 
  Flame, 
  AlertTriangle 
} from 'lucide-react';

interface KanbanBoardProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

const COLUMNS: { id: ProjectStatus; label: string; color: string; desc: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'border-zinc-700 text-zinc-400', desc: 'Raw ideas & future concepts' },
  { id: 'planned', label: 'Planned', color: 'border-blue-500/40 text-blue-400', desc: 'Scoped & prioritized' },
  { id: 'spike', label: 'Spike & R&D', color: 'border-amber-500/40 text-amber-400', desc: 'Feasibility exploration' },
  { id: 'in_progress', label: 'In Progress', color: 'border-emerald-500/40 text-emerald-400', desc: 'Active execution' },
  { id: 'polishing', label: 'Polishing', color: 'border-cyan-500/40 text-cyan-400', desc: 'Review & validation' },
  { id: 'shipped', label: 'Shipped', color: 'border-purple-500/40 text-purple-400', desc: 'Live & available' },
];

const STATUS_ORDER: ProjectStatus[] = ['backlog', 'planned', 'spike', 'in_progress', 'polishing', 'shipped'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projects,
  onSelectProject,
  onUpdateStatus,
}) => {
  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'P0':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <Flame className="h-3 w-3" /> P0
          </span>
        );
      case 'P1':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> P1
          </span>
        );
      case 'P2':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            P2
          </span>
        );
      case 'P3':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            P3
          </span>
        );
    }
  };

  const moveStatus = (e: React.MouseEvent, projectId: string, currentStatus: ProjectStatus, direction: 'prev' | 'next') => {
    e.stopPropagation();
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < STATUS_ORDER.length) {
      onUpdateStatus(projectId, STATUS_ORDER[targetIndex]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {COLUMNS.map((col) => {
        const columnProjects = projects.filter((p) => p.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-xl bg-zinc-950/40 border border-white/[0.06] p-2.5 min-h-[500px]"
          >
            {/* Column header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${
                  col.id === 'in_progress' ? 'bg-emerald-400' :
                  col.id === 'spike' ? 'bg-amber-400' :
                  col.id === 'planned' ? 'bg-blue-400' :
                  col.id === 'polishing' ? 'bg-cyan-400' :
                  col.id === 'shipped' ? 'bg-purple-400' : 'bg-zinc-500'
                }`} />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 m-0">
                  {col.label}
                </h3>
              </div>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
                {columnProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 flex flex-col gap-2.5">
              {columnProjects.length === 0 ? (
                <div className="h-28 border border-dashed border-white/5 rounded-lg flex items-center justify-center text-zinc-600 text-xs italic">
                  Empty
                </div>
              ) : (
                columnProjects.map((project) => {
                  const completedMilestones = project.milestones.filter(m => m.completed).length;
                  const totalMilestones = project.milestones.length;
                  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
                  const statusIdx = STATUS_ORDER.indexOf(project.status);

                  return (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="group mica-card mica-card-hover rounded-xl p-3 cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top metadata */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400">
                            {project.category}
                          </span>
                          {getPriorityBadge(project.priority)}
                        </div>

                        {/* Title & subtitle */}
                        <h4 className="text-xs font-semibold text-white tracking-tight group-hover:text-cyan-400 transition-colors m-0">
                          {project.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {project.subtitle}
                        </p>

                        {/* Tech tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.techStack.slice(0, 2).map((tech) => (
                            <span
                              key={tech}
                              className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-900/90 text-zinc-300 border border-zinc-800"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 2 && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-zinc-900/60 text-zinc-500">
                              +{project.techStack.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Milestones progress bar */}
                      <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
                        {totalMilestones > 0 && (
                          <div className="mb-1.5">
                            <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-1 font-mono">
                              <span>Tasks</span>
                              <span>{completedMilestones}/{totalMilestones} ({progressPct}%)</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Card bottom actions */}
                        <div className="flex items-center justify-between mt-1 pt-1 text-zinc-400 text-xs">
                          {project.path ? (
                            <span className="flex items-center gap-1 font-mono text-[9px] text-cyan-400/80 truncate max-w-[90px]" title={project.path}>
                              <FolderGit2 className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{project.id}</span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-zinc-500 italic">Idea</span>
                          )}

                          {/* Move arrows */}
                          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {statusIdx > 0 && (
                              <button
                                onClick={(e) => moveStatus(e, project.id, project.status, 'prev')}
                                title="Move left"
                                className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}
                            {statusIdx < STATUS_ORDER.length - 1 && (
                              <button
                                onClick={(e) => moveStatus(e, project.id, project.status, 'next')}
                                title="Move right"
                                className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
