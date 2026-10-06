import React, { useState } from 'react';
import type { ProjectIdea } from '../types';
import { Check, Copy } from 'lucide-react';
import { StatusDot, PriorityBadge, ProgressBar, RepoLine, CategoryTag } from './ui';
import { STATUS_META, progressOf } from '../data/status';
import type { Activity } from '../data/repos';
import { TechIcons } from './TechIcons';

interface ProjectCardProps {
  project: ProjectIdea;
  activity?: Activity;
  onOpen: () => void;
  /** Leaves out tech stack, dev command and repo status (roadmap and analytics) */
  compact?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, activity, onOpen, compact }) => {
  const [copied, setCopied] = useState(false);
  const { done, total, pct } = progressOf(project);
  const next = project.milestones.find((m) => !m.completed);
  const cmd = project.commands?.[0]?.cmd;

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cmd) return;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article
      className="focus-card"
      tabIndex={0}
      role="button"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="flex items-center gap-2 text-[12px] text-[var(--fg-3)]">
        <StatusDot status={project.status} />
        <span>{STATUS_META[project.status].label}</span>
        <span>&middot;</span>
        <CategoryTag name={project.category} />
        <span className="ml-auto">
          <PriorityBadge priority={project.priority} />
        </span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.subtitle}</p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[12px] text-[var(--fg-3)] mb-1.5">
          <span>{next ? 'Next' : 'All milestones done'}</span>
          <span className="tabular-nums">
            {done}/{total} &middot; {pct}%
          </span>
        </div>
        <ProgressBar pct={pct} />
        {next && <div className="mt-2 text-[13px] text-[var(--fg)] truncate">{next.text}</div>}
      </div>

      {!compact && (
        <>
          <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--fg-3)]">
            <TechIcons techs={project.techStack} max={7} />
            {cmd && (
              <button className="ml-auto flex items-center gap-1.5 hover:text-[var(--fg)] shrink-0" onClick={copy} title={`Copy: ${cmd}`}>
                <span className="font-mono truncate max-w-[9rem]">{cmd}</span>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </div>
          <RepoLine activity={activity} className="mt-3" />
        </>
      )}
    </article>
  );
};
