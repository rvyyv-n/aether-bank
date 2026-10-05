import React from 'react';
import type { 
  ProjectIdea, 
  ProjectStatus, 
  PriorityLevel 
} from '../types';
import { 
  FolderGit2, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

interface KanbanBoardProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

const COLUMNS: { id: ProjectStatus; label: string; dotColor: string }[] = [
  { id: 'backlog', label: 'Backlog', dotColor: 'bg-zinc-400 dark:bg-zinc-600' },
  { id: 'planned', label: 'Planned', dotColor: 'bg-blue-500' },
  { id: 'spike', label: 'Spike & R&D', dotColor: 'bg-amber-500' },
  { id: 'in_progress', label: 'In Progress', dotColor: 'bg-emerald-500' },
  { id: 'polishing', label: 'Polishing', dotColor: 'bg-sky-500' },
  { id: 'shipped', label: 'Shipped', dotColor: 'bg-purple-500' },
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
            className="flex flex-col rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] p-3 min-h-[520px]"
          >
            {/* Column header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                <h3 className="text-sm font-semibold text-[var(--text-primary)] m-0">
                  {col.label}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-page)] border border-[var(--border-main)]">
                {columnProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 flex flex-col gap-2.5">
              {columnProjects.length === 0 ? (
                <div className="h-28 border border-dashed border-[var(--border-main)] rounded-lg flex items-center justify-center text-[var(--text-muted)] text-xs">
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
                      className="oled-card rounded-lg p-3.5 cursor-pointer flex flex-col justify-between group shadow-xs"
                    >
                      <div>
                        {/* Category & Priority */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                            {project.category}
                          </span>
                          {getPriorityBadge(project.priority)}
                        </div>

                        {/* Title & subtitle */}
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight group-hover:underline m-0">
                          {project.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                          {project.subtitle}
                        </p>

                        {/* Tech tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {project.techStack.slice(0, 2).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded text-xs font-mono bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border-main)]"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-mono text-[var(--text-muted)]">
                              +{project.techStack.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress & Bottom Bar */}
                      <div className="mt-3.5 pt-2.5 border-t border-[var(--border-main)]">
                        {totalMilestones > 0 && (
                          <div className="mb-2.5">
                            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1 font-mono">
                              <span>Tasks</span>
                              <span>{completedMilestones}/{totalMilestones}</span>
                            </div>
                            <div className="w-full bg-[var(--bg-page)] h-1.5 rounded-full overflow-hidden border border-[var(--border-main)]">
                              <div
                                className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Card bottom footer */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          {project.path ? (
                            <span className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)] truncate max-w-[120px]" title={project.path}>
                              <FolderGit2 className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{project.id}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)] font-mono">Idea</span>
                          )}

                          {/* Quick stage move buttons */}
                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            {statusIdx > 0 && (
                              <button
                                onClick={(e) => moveStatus(e, project.id, project.status, 'prev')}
                                title="Move back"
                                className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {statusIdx < STATUS_ORDER.length - 1 && (
                              <button
                                onClick={(e) => moveStatus(e, project.id, project.status, 'next')}
                                title="Move forward"
                                className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
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
