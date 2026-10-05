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

const COLUMNS: { id: ProjectStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#71717a' },
  { id: 'planned', label: 'Planned', color: '#3b82f6' },
  { id: 'spike', label: 'Exploring', color: '#f59e0b' },
  { id: 'in_progress', label: 'In Progress', color: '#10b981' },
  { id: 'polishing', label: 'Polishing', color: '#0ea5e9' },
  { id: 'shipped', label: 'Shipped', color: '#a855f7' },
];

const STATUS_ORDER: ProjectStatus[] = [
  'backlog',
  'planned',
  'spike',
  'in_progress',
  'polishing',
  'shipped',
];

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

  const moveStatus = (
    e: React.MouseEvent,
    projectId: string,
    currentStatus: ProjectStatus,
    direction: 'prev' | 'next'
  ) => {
    e.stopPropagation();
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < STATUS_ORDER.length) {
      onUpdateStatus(projectId, STATUS_ORDER[targetIndex]);
    }
  };

  return (
    <div className="kanban-scroll flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 md:w-full overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2">
      {COLUMNS.map((col) => {
        const columnProjects = projects.filter((p) => p.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-lg bg-[var(--surface)] border border-[var(--line)] p-3 ${columnProjects.length === 0 ? 'max-md:hidden' : ''} min-h-[60dvh] md:min-h-[600px] w-[84%] shrink-0 snap-center md:w-auto md:shrink`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="text-xs font-semibold text-[var(--fg)] m-0">
                  {col.label}
                </h3>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[11px] font-mono text-[var(--fg-3)] bg-[var(--bg)] border border-[var(--line)]">
                {columnProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 flex flex-col gap-2.5">
              {columnProjects.length === 0 ? (
                <div className="h-24 border border-dashed border-[var(--line)] rounded-md flex items-center justify-center text-[var(--fg-3)] text-xs font-mono">
                  Empty
                </div>
              ) : (
                columnProjects.map((project) => {
                  const completedMilestones = project.milestones.filter(
                    (m) => m.completed
                  ).length;
                  const totalMilestones = project.milestones.length;
                  const progressPct =
                    totalMilestones > 0
                      ? Math.round((completedMilestones / totalMilestones) * 100)
                      : 0;
                  const statusIdx = STATUS_ORDER.indexOf(project.status);
                  const nextMilestone = project.milestones.find((m) => !m.completed);
                  const primaryCommand =
                    project.commands && project.commands.length > 0
                      ? project.commands[0]
                      : null;

                  return (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="slop-card rounded-md p-3 cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Category & Priority */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-3)]">
                            {project.category}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {project.license && (
                              <span className="text-[10px] font-mono text-[var(--fg-3)] border border-[var(--line)] px-1 py-0.2 rounded">
                                {project.license}
                              </span>
                            )}
                            {getPriorityBadge(project.priority)}
                          </div>
                        </div>

                        {/* Title & subtitle */}
                        <h4 className="text-xs font-semibold text-[var(--fg)] tracking-tight group-hover:text-[var(--accent)] transition-colors m-0">
                          {project.title}
                        </h4>
                        <p className="text-[11px] text-[var(--fg-2)] mt-1.5 line-clamp-2 leading-relaxed">
                          {project.subtitle}
                        </p>

                        {/* Next Milestone preview */}
                        {nextMilestone && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-mono text-[var(--fg-2)] bg-[var(--bg)] border border-[var(--line)] px-2 py-1 rounded">
                            <CircleDot className="h-3 w-3 text-amber-500/90 flex-shrink-0" />
                            <span className="truncate text-[10.5px]">
                              {nextMilestone.text}
                            </span>
                          </div>
                        )}

                        {/* Tech tags */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
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

                        {/* Command shortcut pill */}
                        {primaryCommand && (
                          <div
                            className="mt-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) =>
                                copyToClipboard(
                                  e,
                                  primaryCommand.cmd,
                                  `k-cmd-${project.id}`
                                )
                              }
                              className="w-full flex items-center justify-between px-2 py-1 rounded border border-[var(--line)] hover:border-[var(--line-2)] font-mono text-[11px] text-[var(--fg-2)] hover:text-[var(--fg)] bg-[var(--bg)] transition cursor-pointer"
                              title={`Copy: ${primaryCommand.cmd}`}
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <Terminal className="h-3 w-3 flex-shrink-0 opacity-70" />
                                <span className="truncate text-[10.5px]">
                                  {primaryCommand.cmd}
                                </span>
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
                      <div className="mt-3 pt-2 border-t border-[var(--line)]">
                        {totalMilestones > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-[11px] text-[var(--fg-3)] mb-1 font-mono">
                              <span>Milestones</span>
                              <span>
                                {completedMilestones}/{totalMilestones} ({progressPct}%)
                              </span>
                            </div>
                            <div className="slop-progress-track">
                              <div
                                className="slop-progress-fill"
                                style={{
                                  width: `${progressPct}%`,
                                  backgroundColor:
                                    progressPct === 100
                                      ? '#a855f7'
                                      : 'var(--accent)',
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Card bottom footer */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {project.path ? (
                              <button
                                onClick={(e) =>
                                  copyToClipboard(
                                    e,
                                    project.path!,
                                    `k-path-${project.id}`
                                  )
                                }
                                title={`Copy path: ${project.path}`}
                                className="flex items-center gap-1 font-mono text-[11px] text-[var(--fg-3)] hover:text-[var(--fg)] truncate max-w-[100px] cursor-pointer"
                              >
                                <FolderGit2 className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {project.path.split(/[/\\\\]/).pop()}
                                </span>
                                {copiedId === `k-path-${project.id}` && (
                                  <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                                )}
                              </button>
                            ) : (
                              <span className="text-[10px] text-[var(--fg-3)] font-mono">
                                Idea
                              </span>
                            )}

                            {project.upstreamRefs &&
                              project.upstreamRefs.length > 0 && (
                                <a
                                  href={project.upstreamRefs[0].url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={project.upstreamRefs[0].name}
                                  className="text-[var(--fg-3)] hover:text-[var(--fg)] transition"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                          </div>

                          {/* Quick stage move buttons */}
                          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            {statusIdx > 0 && (
                              <button
                                onClick={(e) =>
                                  moveStatus(
                                    e,
                                    project.id,
                                    project.status,
                                    'prev'
                                  )
                                }
                                title="Move back"
                                className="p-0.5 rounded hover:bg-[var(--hover)] text-[var(--fg-3)] hover:text-[var(--fg)] transition cursor-pointer"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}
                            {statusIdx < STATUS_ORDER.length - 1 && (
                              <button
                                onClick={(e) =>
                                  moveStatus(
                                    e,
                                    project.id,
                                    project.status,
                                    'next'
                                  )
                                }
                                title="Move forward"
                                className="p-0.5 rounded hover:bg-[var(--hover)] text-[var(--fg-3)] hover:text-[var(--fg)] transition cursor-pointer"
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
