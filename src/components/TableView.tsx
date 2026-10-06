import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus, SortProps } from '../types';
import { 
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { StatusDot, StatusOptions, PriorityBadge, ProgressBar, SortHead, RepoLine, CategoryTag } from './ui';
import type { ActivityMap } from '../data/repos';
import { TechIcons } from './TechIcons';
import { progressOf } from '../data/status';

interface TableViewProps extends SortProps {
  projects: ProjectIdea[];
  activity: ActivityMap;
  onSelectProject: (project: ProjectIdea) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  projects,
  activity,
  onSelectProject,
  onUpdateStatus,
  sortBy,
  sortReversed,
  onSort,
}) => {
  const head = (key: SortProps['sortBy'], label: string) => (
    <SortHead label={label} active={sortBy === key} reversed={sortReversed} onClick={() => onSort(key)} />
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
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
    <div className="page">
    <div className="page-head">
      <div>
        <h1>
          Table
          <span>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
        </h1>
        <p>Every project at a glance. Change a status here or open one for detail.</p>
      </div>
    </div>
    <div className="md:hidden space-y-2.5">
      {projects.length === 0 && (
        <div className="py-12 text-center text-xs text-[var(--fg-3)] font-mono">
          No projects matching active filters.
        </div>
      )}
      {projects.map((project) => {
        const { done: completed, total, pct } = progressOf(project);
        return (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3.5 active:bg-[var(--hover)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm text-[var(--fg)] truncate">{project.title}</span>
              <PriorityBadge priority={project.priority} />
            </div>
            <div className="text-xs text-[var(--fg-2)] mt-1 line-clamp-2">{project.subtitle}</div>
            <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <StatusDot status={project.status} />
              <select
                value={project.status}
                onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
                className="bg-[var(--bg)] border border-[var(--line)] rounded px-2 py-1.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
              >
                <StatusOptions />
              </select>
              <span className="ml-auto text-[12px] font-mono text-[var(--fg-3)]">{completed}/{total} &middot; {pct}%</span>
            </div>
            <ProgressBar pct={pct} className="mt-2" />
          </div>
        );
      })}
    </div>
    <div className="hidden md:block w-full">
      <div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] text-[var(--fg-3)] text-[11.5px] select-none">
              <th className="py-2 pr-4 font-normal whitespace-nowrap">{head('priority', 'Priority')}</th>
              <th className="py-2 pr-4 font-normal whitespace-nowrap">{head('title', 'Project')}</th>
              <th className="py-2 pr-4 font-normal whitespace-nowrap">{head('status', 'Status')}</th>
              <th className="py-2 pr-4 font-normal whitespace-nowrap">{head('progress', 'Milestones')}</th>
              <th className="py-2 pr-4 font-normal whitespace-nowrap">Tech Stack</th>
              <th className="py-2 pr-4 font-normal whitespace-nowrap hidden 2xl:table-cell">Dev Command</th>
              <th className="py-2 pr-4 font-normal whitespace-nowrap">{head('updated', 'Updated')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] font-normal">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[var(--fg-3)] font-mono">
                  No projects matching active filters.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const { done: completed, total, pct } = progressOf(project);
                const primaryCommand = project.commands?.[0] ?? null;

                return (
                  <tr
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="hover:bg-[var(--hover)] transition-colors cursor-pointer group"
                  >
                    {/* Priority */}
                    <td className="py-3 pr-4 whitespace-nowrap align-middle">
                      <PriorityBadge priority={project.priority} />
                    </td>

                    {/* Title & Category */}
                    <td className="py-3 pr-4 align-middle min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                          {project.title}
                        </span>
                        <CategoryTag name={project.category} className="text-[11.5px] text-[var(--fg-3)]" />
                      </div>
                      <div className="text-[12px] text-[var(--fg-2)] truncate max-w-sm mt-0.5">
                        {project.subtitle}
                      </div>
                      <RepoLine activity={activity[project.id]} className="mt-1" />
                    </td>

                    {/* Status with dot */}
                    <td className="py-3 pr-4 whitespace-nowrap align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <StatusDot status={project.status} />
                        <select
                          value={project.status}
                          onChange={(e) =>
                            onUpdateStatus(project.id, e.target.value as ProjectStatus)
                          }
                          className="bg-[var(--bg)] border border-[var(--line)] rounded px-2 py-1 text-xs text-[var(--fg)] cursor-pointer focus:outline-none focus:border-[var(--accent)]"
                        >
                          <StatusOptions />
                        </select>
                      </div>
                    </td>

                    {/* Milestones Progress */}
                    <td className="py-3 pr-4 align-middle min-w-[150px]">
                      <div className="flex items-center justify-between text-[12px] font-mono text-[var(--fg-3)] mb-1">
                        <span>{completed}/{total}</span>
                        <span>{pct}%</span>
                      </div>
                      <ProgressBar pct={pct} />
                    </td>

                    {/* Tech Stack */}
                    <td className="py-3 pr-4 align-middle">
                      <TechIcons techs={project.techStack} />
                    </td>

                    {/* Dev Command */}
                    <td className="py-3 pr-4 whitespace-nowrap align-middle hidden 2xl:table-cell" onClick={(e) => e.stopPropagation()}>
                      {primaryCommand ? (
                        <button
                          onClick={(e) =>
                            copyToClipboard(
                              e,
                              primaryCommand.cmd,
                              `tbl-cmd-${project.id}`
                            )
                          }
                          className="flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--line)] hover:border-[var(--line-2)] font-mono text-[12px] text-[var(--fg-2)] hover:text-[var(--fg)] bg-[var(--bg)] transition cursor-pointer"
                          title={`Copy: ${primaryCommand.cmd}`}
                        >
                          <Terminal className="h-3 w-3 opacity-60" />
                          <span className="truncate max-w-[120px]">{primaryCommand.cmd}</span>
                          {copiedId === `tbl-cmd-${project.id}` ? (
                            <Check className="h-3 w-3 text-[var(--accent)]" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : project.path ? (
                        <span className="text-[12px] font-mono text-[var(--fg-3)] truncate max-w-[120px] block">
                          {project.path.split(/[/\\\\]/).pop()}
                        </span>
                      ) : (
                        <span className="text-[12px] font-mono text-[var(--fg-3)]">&mdash;</span>
                      )}
                    </td>

                    {/* Updated */}
                    <td className="py-3 pr-4 whitespace-nowrap font-mono text-[12px] text-[var(--fg-3)] align-middle">
                      {formatShortDate(project.updatedAt)}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};
