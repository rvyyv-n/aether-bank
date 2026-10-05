import React, { useState } from 'react';
import type {
  ProjectIdea,
  ProjectStatus,
  PriorityLevel
} from '../types';
import {
  X,
  CheckSquare,
  Square,
  FolderGit2,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Edit3,
  Trash2
} from 'lucide-react';
import { StatusDot, StatusOptions, PriorityBadge, ProgressBar } from './ui';
import { PRIORITY_META, progressOf } from '../data/status';

interface ProjectDrawerProps {
  project: ProjectIdea | null;
  onClose: () => void;
  onUpdateProject: (updated: ProjectIdea) => void;
  onDeleteProject: (projectId: string) => void;
}

const getNowIso = () => new Date().toISOString();

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const Section: React.FC<{ label: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode }> = ({
  label,
  aside,
  children,
}) => (
  <section>
    <div className="flex items-center justify-between">
      <h3 className="field-label">{label}</h3>
      {aside}
    </div>
    {children}
  </section>
);

const DrawerContent: React.FC<{
  project: ProjectIdea;
  onClose: () => void;
  onUpdateProject: (updated: ProjectIdea) => void;
  onDeleteProject: (projectId: string) => void;
}> = ({
  project,
  onClose,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(project.notes || '');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const update = (patch: Partial<ProjectIdea>) =>
    onUpdateProject({ ...project, ...patch, updatedAt: getNowIso() });

  const toggleMilestone = (milestoneId: string) =>
    update({
      milestones: project.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    });

  const handleSaveNotes = () => {
    update({ notes: notesValue });
    setIsEditingNotes(false);
  };

  const { done, total, pct } = progressOf(project);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden backdrop flex justify-end" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="drawer-panel w-full max-w-xl bg-[var(--surface)] border-l border-[var(--line)] h-full overflow-y-auto flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[var(--surface)] px-5 sm:px-6 py-3 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="tag uppercase tracking-wider">{project.category}</span>
            {project.license && <span className="tag">{project.license}</span>}
            <span className="text-[11px] font-mono text-[var(--fg-3)] truncate">{project.id}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (confirm(`Delete "${project.title}" from Banker?`)) {
                  onDeleteProject(project.id);
                  onClose();
                }
              }}
              className="icon-button hover:!text-rose-500 hover:!bg-rose-500/10 hover:!border-transparent"
              title="Delete project"
              aria-label="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="icon-button"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-6 space-y-6 flex-1 text-xs">
          {/* Title */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 id="drawer-title" className="text-xl font-semibold text-[var(--fg)] tracking-tight m-0">
                {project.title}
              </h2>
              <div className="pt-1.5">
                <PriorityBadge priority={project.priority} />
              </div>
            </div>
            <p className="text-[13px] text-[var(--fg-2)] mt-1 mb-0 leading-relaxed">
              {project.subtitle}
            </p>
          </div>

          {/* Status & priority */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="field-label">Status</span>
              <span className="relative block">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex pointer-events-none">
                  <StatusDot status={project.status} />
                </span>
                <select
                  value={project.status}
                  onChange={(e) => update({ status: e.target.value as ProjectStatus })}
                  className="field !pl-6"
                >
                  <StatusOptions />
                </select>
              </span>
            </label>

            <label className="block">
              <span className="field-label">Priority</span>
              <select
                value={project.priority}
                onChange={(e) => update({ priority: e.target.value as PriorityLevel })}
                className="field"
              >
                {(Object.keys(PRIORITY_META) as PriorityLevel[]).map((p) => (
                  <option key={p} value={p}>
                    {p} · {PRIORITY_META[p]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* About */}
          {(project.description || project.problemStatement) && (
            <Section label="About">
              <div className="space-y-2 text-[12.5px] leading-relaxed text-[var(--fg-2)]">
                {project.description && <p className="m-0">{project.description}</p>}
                {project.problemStatement && (
                  <p className="m-0">
                    <span className="text-[var(--fg)] font-medium">Problem: </span>
                    {project.problemStatement}
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* Milestones */}
          <Section
            label={`Milestones · ${done}/${total}`}
            aside={<span className="text-[11px] font-mono text-[var(--fg-2)] mb-1.5">{pct}%</span>}
          >
            <ProgressBar pct={pct} className="mb-2.5" />
            <div className="space-y-1">
              {project.milestones.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  aria-pressed={m.completed}
                  className="w-full flex items-start gap-2.5 px-2 py-1.5 rounded-md hover:bg-[var(--hover)] transition select-none"
                >
                  {m.completed ? (
                    <CheckSquare className="h-4 w-4 text-[var(--accent)] flex-shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-[var(--fg-3)] flex-shrink-0" />
                  )}
                  <span
                    className={`text-[12.5px] leading-snug ${
                      m.completed ? 'line-through text-[var(--fg-3)]' : 'text-[var(--fg)]'
                    }`}
                  >
                    {m.text}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          {/* Workspace & links */}
          {(project.path || (project.upstreamRefs && project.upstreamRefs.length > 0)) && (
            <Section label="Workspace & links">
              <div className="space-y-1.5">
                {project.path && (
                  <div className="flex items-center justify-between p-2 rounded-md border border-[var(--line)] bg-[var(--bg)] font-mono text-xs">
                    <span className="flex items-center gap-2 text-[var(--fg-2)] min-w-0">
                      <FolderGit2 className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                      <span className="truncate">{project.path}</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(project.path!, 'path')}
                      className="p-1 rounded text-[var(--fg-3)] hover:text-[var(--fg)] transition ml-2"
                      title="Copy path"
                      aria-label="Copy path"
                    >
                      {copiedCmd === 'path' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {project.upstreamRefs?.map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 p-2 rounded-md border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--line-2)] text-xs text-[var(--fg-2)] hover:text-[var(--fg)] transition group"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-[var(--fg-3)] group-hover:text-[var(--accent)] transition" />
                      <span>{ref.name}</span>
                    </span>
                    <span className="font-mono text-[11px] text-[var(--fg-3)] truncate max-w-[220px]">
                      {ref.url.replace(/^https?:\/\//, '')}
                    </span>
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Commands */}
          {project.commands && project.commands.length > 0 && (
            <Section label="Commands">
              <div className="space-y-1.5">
                {project.commands.map((cmd) => (
                  <button
                    key={cmd.cmd}
                    onClick={() => copyToClipboard(cmd.cmd, cmd.cmd)}
                    title="Copy command"
                    className="w-full flex items-center justify-between gap-2 p-2 rounded-md border border-[var(--line)] hover:border-[var(--line-2)] bg-[var(--bg)] font-mono text-xs transition group"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Terminal className="h-3.5 w-3.5 text-[var(--fg-3)] flex-shrink-0" />
                      <span className="text-[var(--fg-3)] flex-shrink-0">{cmd.label}</span>
                      <span className="text-[var(--fg)] truncate">{cmd.cmd}</span>
                    </span>
                    {copiedCmd === cmd.cmd ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[var(--fg-3)] group-hover:text-[var(--fg)] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Tech stack */}
          {project.techStack.length > 0 && (
          <Section label="Tech stack">
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span key={tech} className="tag !text-[11px] !leading-5">
                  {tech}
                </span>
              ))}
            </div>
          </Section>
          )}

          {/* Architecture */}
          {project.architectureNotes && (
            <Section label="Architecture">
              <p className="m-0 text-[12.5px] leading-relaxed text-[var(--fg-2)]">
                {project.architectureNotes}
              </p>
            </Section>
          )}

          {/* Notes */}
          <Section
            label="Notes"
            aside={
              !isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline mb-1.5"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              )
            }
          >
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSaveNotes();
                  }}
                  rows={6}
                  className="field font-mono leading-relaxed"
                  placeholder="Thoughts, findings, decisions..."
                />
                <div className="flex items-center justify-end gap-2">
                  <span className="mr-auto text-[10.5px] text-[var(--fg-3)] font-mono">Ctrl+Enter to save</span>
                  <button
                    onClick={() => {
                      setNotesValue(project.notes || '');
                      setIsEditingNotes(false);
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button onClick={handleSaveNotes} className="btn-accent">
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNotes(true)}
                className="p-3 rounded-md border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg-2)] leading-relaxed whitespace-pre-wrap font-mono cursor-text hover:border-[var(--line-2)] transition"
              >
                {project.notes || (
                  <span className="text-[var(--fg-3)] italic">No notes yet. Click to add some.</span>
                )}
              </div>
            )}
          </Section>

          <div className="pt-2 text-[11px] font-mono text-[var(--fg-3)]">
            Updated {formatDate(project.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
  project,
  onClose,
  onUpdateProject,
  onDeleteProject,
}) => {
  if (!project) return null;

  return (
    <DrawerContent
      key={project.id}
      project={project}
      onClose={onClose}
      onUpdateProject={onUpdateProject}
      onDeleteProject={onDeleteProject}
    />
  );
};
