import React from 'react';
import type { ProjectIdea } from '../types';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { progressOf, STATUS_META } from '../data/status';
import { idleLabel, type Activity } from '../data/repos';
import { StatusDot, PriorityBadge, ProgressBar } from './ui';
import { ProjectBody } from './ProjectBody';

interface ProjectPageProps {
  project: ProjectIdea;
  categories: string[];
  activity?: Activity;
  onBack: () => void;
  onUpdateProject: (updated: ProjectIdea) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectPage: React.FC<ProjectPageProps> = ({
  project,
  categories,
  activity,
  onBack,
  onUpdateProject,
  onDeleteProject,
}) => {
  const { done, total, pct } = progressOf(project);
  const upNext = project.milestones.filter((m) => !m.completed).slice(0, 4);
  const repo = activity?.repo?.found ? activity.repo : undefined;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <button className="text-button inline-flex items-center gap-1.5 mb-3" onClick={onBack}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="flex items-center gap-2 text-[12px] text-[var(--fg-3)]">
            <StatusDot status={project.status} />
            <span>{STATUS_META[project.status].label}</span>
            <PriorityBadge priority={project.priority} />
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm(`Delete "${project.title}" from Banker?`)) {
              onDeleteProject(project.id);
              onBack();
            }
          }}
          className="icon-button hover:!text-rose-500"
          title="Delete project"
          aria-label="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="project-layout">
        <ProjectBody project={project} categories={categories} onUpdateProject={onUpdateProject} />

        <aside className="project-rail" aria-label="Repo and activity">
          <section>
            <div className="section-head">
              <h3>Progress</h3>
              <span className="row-count">
                {done}/{total} · {pct}%
              </span>
            </div>
            <ProgressBar pct={pct} className="mt-3" />
            {upNext.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-[13px] text-[var(--fg)] list-none p-0">
                {upNext.map((m) => (
                  <li key={m.id} className="truncate">
                    {m.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="side-note mt-3">{total > 0 ? 'Every milestone is done.' : 'No milestones yet.'}</p>
            )}
          </section>

          <section>
            <div className="section-head">
              <h3>Repo</h3>
            </div>
            {repo ? (
              <dl className="rail-facts">
                <dt>Branch</dt>
                <dd className="font-mono">{repo.branch ?? 'none'}</dd>
                <dt>Last commit</dt>
                <dd>
                  <span className="font-mono">{repo.commit}</span> {repo.subject}
                </dd>
                <dt>Working tree</dt>
                <dd>{repo.dirty ? `${repo.dirty} uncommitted` : 'Clean'}</dd>
                {repo.ahead !== undefined && (
                  <>
                    <dt>Remote</dt>
                    <dd>{repo.ahead || repo.behind ? `${repo.ahead} ahead, ${repo.behind} behind` : 'In sync'}</dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="side-note mt-3">
                {project.path
                  ? 'No git repository found for this path. Use a full path if it sits outside your code folders.'
                  : 'Set a repo path to see branch and commit details.'}
              </p>
            )}
          </section>

          <section>
            <div className="section-head">
              <h3>Activity</h3>
            </div>
            {activity?.lastActive ? (
              <dl className="rail-facts">
                <dt>Last active</dt>
                <dd>
                  {new Date(activity.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                  <span className="text-[var(--fg-3)]">({idleLabel(activity.daysIdle)})</span>
                </dd>
              </dl>
            ) : (
              <p className="side-note mt-3">No commits or coding sessions found for this folder.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};
