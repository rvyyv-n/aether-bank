import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus } from '../types';
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
import { StatusDot, PriorityBadge, ProgressBar } from './ui';
import { STATUS_ORDER, STATUS_META, progressOf } from '../data/status';

interface KanbanBoardProps {
  projects: ProjectIdea[];
  onSelectProject: (project: ProjectIdea) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

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

  const moveTo = (e: React.MouseEvent, projectId: string, target: ProjectStatus) => {
    e.stopPropagation();
    onUpdateStatus(projectId, target);
  };

  return (
    <div className="kanban-scroll flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:w-full overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2 items-start">
      {STATUS_ORDER.map((status) => {
        const columnProjects = projects.filter((p) => p.status === status);

        return (
          <section
            key={status}
            aria-label={STATUS_META[status].label}
            className={`flex flex-col rounded-lg bg-[var(--surface)] border border-[var(--line)] p-2.5 ${columnProjects.length === 0 ? 'max-md:hidden' : ''} w-[86%] shrink-0 snap-center md:w-auto md:shrink`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1 pb-2.5">
              <div className="flex items-center gap-2">
                <StatusDot status={status} />
                <h3 className="text-xs font-semibold text-[var(--fg)] m-0">
                  {STATUS_META[status].label}
                </h3>
              </div>
              <span className="text-[12px] font-mono text-[var(--fg-3)]">
                {columnProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {columnProjects.length === 0 ? (
                <div className="py-6 border border-dashed border-[var(--line)] rounded-md text-center text-[var(--fg-3)] text-[12px]">
                  Nothing here
                </div>
              ) : (
                columnProjects.map((project) => {
                  const { done, total, pct } = progressOf(project);
                  const statusIdx = STATUS_ORDER.indexOf(project.status);
                  const prevStatus = STATUS_ORDER[statusIdx - 1];
                  const nextStatus = STATUS_ORDER[statusIdx + 1];
                  const nextMilestone = project.milestones.find((m) => !m.completed);
                  const primaryCommand = project.commands?.[0] ?? null;

                  return (
                    <article
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      onKeyDown={(e) => {
                        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onSelectProject(project);
                        }
                      }}
                      tabIndex={0}
                      aria-label={`Open ${project.title}`}
                      className="slop-card card-lift rounded-md p-3 cursor-pointer flex flex-col group"
                    >
                      {/* Category & Priority */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-3)]">
                          {project.category}
                        </span>
                        <PriorityBadge priority={project.priority} />
                      </div>

                      {/* Title & subtitle */}
                      <h4 className="text-[13px] font-semibold text-[var(--fg)] tracking-tight m-0">
                        {project.title}
                      </h4>
                      <p className="text-[11.5px] text-[var(--fg-2)] mt-1 mb-0 line-clamp-2 leading-relaxed">
                        {project.subtitle}
                      </p>

                      {/* Next milestone */}
                      {nextMilestone && (
                        <div className="mt-2.5 flex items-start gap-1.5 text-[12px] text-[var(--fg-2)]">
                          <CircleDot className="h-3 w-3 mt-0.5 text-[var(--accent)] flex-shrink-0" />
                          <span className="line-clamp-1" title={nextMilestone.text}>
                            {nextMilestone.text}
                          </span>
                        </div>
                      )}

                      {/* Tech tags */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span key={tech} className="tag">
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="tag text-[var(--fg-3)]" title={project.techStack.slice(3).join(', ')}>
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Command shortcut */}
                      {primaryCommand && (
                        <button
                          onClick={(e) => copyToClipboard(e, primaryCommand.cmd, `k-cmd-${project.id}`)}
                          className="mt-2.5 w-full flex items-center justify-between gap-2 px-2 py-1 rounded border border-[var(--line)] hover:border-[var(--line-2)] font-mono text-[11.5px] text-[var(--fg-2)] hover:text-[var(--fg)] bg-[var(--bg)] transition"
                          title={`Copy: ${primaryCommand.cmd}`}
                        >
                          <span className="flex items-center gap-1.5 min-w-0">
                            <Terminal className="h-3 w-3 flex-shrink-0 opacity-70" />
                            <span className="truncate">{primaryCommand.cmd}</span>
                          </span>
                          {copiedId === `k-cmd-${project.id}` ? (
                            <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-50 flex-shrink-0" />
                          )}
                        </button>
                      )}

                      {/* Progress */}
                      {total > 0 && (
                        <div className="mt-3 flex items-center gap-2" title={`${done} of ${total} milestones`}>
                          <ProgressBar pct={pct} className="flex-1" />
                          <span className="text-[11.5px] font-mono text-[var(--fg-3)] tabular-nums">
                            {done}/{total}
                          </span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-[var(--line)]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {project.path ? (
                            <button
                              onClick={(e) => copyToClipboard(e, project.path!, `k-path-${project.id}`)}
                              title={`Copy path: ${project.path}`}
                              className="flex items-center gap-1 font-mono text-[12px] text-[var(--fg-3)] hover:text-[var(--fg)] min-w-0 max-w-[120px]"
                            >
                              {copiedId === `k-path-${project.id}` ? (
                                <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <FolderGit2 className="h-3 w-3 flex-shrink-0" />
                              )}
                              <span className="truncate">{project.path.split(/[/\\]/).pop()}</span>
                            </button>
                          ) : (
                            <span className="text-[11.5px] text-[var(--fg-3)] font-mono">Idea</span>
                          )}

                          {project.upstreamRefs && project.upstreamRefs.length > 0 && (
                            <a
                              href={project.upstreamRefs[0].url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={`Open ${project.upstreamRefs[0].name}`}
                              aria-label={`Open ${project.upstreamRefs[0].name}`}
                              className="text-[var(--fg-3)] hover:text-[var(--fg)] transition"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {/* Quick stage moves */}
                        <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
                          {prevStatus && (
                            <button
                              onClick={(e) => moveTo(e, project.id, prevStatus)}
                              title={`Move to ${STATUS_META[prevStatus].label}`}
                              aria-label={`Move to ${STATUS_META[prevStatus].label}`}
                              className="p-1 rounded hover:bg-[var(--bg)] text-[var(--fg-3)] hover:text-[var(--fg)] transition"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              onClick={(e) => moveTo(e, project.id, nextStatus)}
                              title={`Move to ${STATUS_META[nextStatus].label}`}
                              aria-label={`Move to ${STATUS_META[nextStatus].label}`}
                              className="p-1 rounded hover:bg-[var(--bg)] text-[var(--fg-3)] hover:text-[var(--fg)] transition"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};
