import React, { useState } from 'react';
import type { 
  ProjectIdea, 
  ProjectStatus, 
  PriorityLevel 
} from '../types';
import { 
  FolderGit2, 
  ArrowRight, 
  ArrowLeft,
  CircleDot,
  Terminal,
  Check,
  Copy,
  ExternalLink
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

  const moveStatus = (e: React.MouseEvent, projectId: string, currentStatus: ProjectStatus, direction: 'prev' | 'next') => {
    e.stopPropagation();
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < STATUS_ORDER.length) {
      onUpdateStatus(projectId, STATUS_ORDER[targetIndex]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 w-full">
      {COLUMNS.map((col) => {
        const columnProjects = projects.filter((p) => p.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] p-3 min-h-[550px]"
          >
            {/* Column header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                <h3 className="text-sm font-semibold text-[var(--text-primary)] m-0">
                  {col.label}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-main)]">
                {columnProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 flex flex-col gap-2.5">
              {columnProjects.length === 0 ? (
                <div className="h-28 border border-dashed border-[var(--border-main)] rounded-lg flex items-center justify-center text-[var(--text-muted)] text-xs font-mono">
                  Empty
                </div>
              ) : (
                columnProjects.map((project) => {
                  const completedMilestones = project.milestones.filter(m => m.completed).length;
                  const totalMilestones = project.milestones.length;
                  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
                  const statusIdx = STATUS_ORDER.indexOf(project.status);
                  const nextMilestone = project.milestones.find(m => !m.completed);
                  const primaryCommand = project.commands && project.commands.length > 0 ? project.commands[0] : null;

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
                          <div className="flex items-center gap-1.5">
                            {project.license && (
                              <span className="text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-main)] px-1 py-0.2 rounded">
                                {project.license}
                              </span>
                            )}
                            {getPriorityBadge(project.priority)}
                          </div>
                        </div>

                        {/* Title & subtitle */}
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight group-hover:underline m-0">
                          {project.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                          {project.subtitle}
                        </p>

                        {/* Next Milestone preview */}
                        {nextMilestone && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-main)] px-2 py-1 rounded">
                            <CircleDot className="h-3 w-3 text-amber-500/90 flex-shrink-0" />
                            <span className="truncate text-[11px]">{nextMilestone.text}</span>
                          </div>
                        )}

                        {/* Tech tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {project.techStack.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded text-xs font-mono bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-main)]"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-mono text-[var(--text-muted)] border border-[var(--border-main)]">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Command shortcut pill */}
                        {primaryCommand && (
                          <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => copyToClipboard(e, primaryCommand.cmd, `k-cmd-${project.id}`)}
                              className="w-full flex items-center justify-between px-2 py-1 rounded border border-[var(--border-main)] hover:border-[var(--text-muted)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                              title={`Copy: ${primaryCommand.cmd}`}
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <Terminal className="h-3 w-3 flex-shrink-0 opacity-70" />
                                <span className="truncate text-[11px]">{primaryCommand.cmd}</span>
                              </span>
                              {copiedId === `k-cmd-${project.id}` ? (
                                <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-50 flex-shrink-0" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Progress & Bottom Bar */}
                      <div className="mt-3.5 pt-2.5 border-t border-[var(--border-main)]">
                        {totalMilestones > 0 && (
                          <div className="mb-2.5">
                            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1 font-mono">
                              <span>Tasks</span>
                              <span>{completedMilestones}/{totalMilestones} ({progressPct}%)</span>
                            </div>
                            <div className="w-full bg-[var(--border-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-main)]">
                              <div
                                className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Card bottom footer */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {project.path ? (
                              <button
                                onClick={(e) => copyToClipboard(e, project.path!, `k-path-${project.id}`)}
                                title={`Copy path: ${project.path}`}
                                className="flex items-center gap-1 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] truncate max-w-[110px]"
                              >
                                <FolderGit2 className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate text-[11px]">{project.path.split(/[/\\]/).pop()}</span>
                                {copiedId === `k-path-${project.id}` && (
                                  <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-[var(--text-muted)] font-mono">Idea</span>
                            )}

                            {project.upstreamRefs && project.upstreamRefs.length > 0 && (
                              <a
                                href={project.upstreamRefs[0].url}
                                target="_blank"
                                rel="noreferrer"
                                title={project.upstreamRefs[0].name}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>

                          {/* Quick stage move buttons */}
                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            {statusIdx > 0 && (
                              <button
                                onClick={(e) => moveStatus(e, project.id, project.status, 'prev')}
                                title="Move back"
                                className="p-1 rounded hover:border-[var(--text-muted)] border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {statusIdx < STATUS_ORDER.length - 1 && (
                              <button
                                onClick={(e) => moveStatus(e, project.id, project.status, 'next')}
                                title="Move forward"
                                className="p-1 rounded hover:border-[var(--text-muted)] border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
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
