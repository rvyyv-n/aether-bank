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
  Save, 
  Trash2
} from 'lucide-react';

interface ProjectDrawerProps {
  project: ProjectIdea | null;
  onClose: () => void;
  onUpdateProject: (updated: ProjectIdea) => void;
  onDeleteProject: (projectId: string) => void;
}

const getNowIso = () => new Date().toISOString();

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

  const toggleMilestone = (milestoneId: string) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    onUpdateProject({
      ...project,
      milestones: updatedMilestones,
      updatedAt: getNowIso(),
    });
  };

  const handleSaveNotes = () => {
    onUpdateProject({
      ...project,
      notes: notesValue,
      updatedAt: getNowIso(),
    });
    setIsEditingNotes(false);
  };

  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progressPct =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-xl bg-[var(--surface)] border-l border-[var(--line)] h-full overflow-y-auto flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[var(--surface)] px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--fg-3)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)]">
              {project.category}
            </span>
            <span className="text-[11px] font-mono text-[var(--fg-3)]">&middot; {project.id}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (confirm(`Delete "${project.title}" from Banker?`)) {
                  onDeleteProject(project.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded text-[var(--fg-3)] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Header Title & Subtitle */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-[var(--fg)] tracking-tight m-0">
                {project.title}
              </h2>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[var(--bg)] text-[var(--fg-2)] border border-[var(--line)]">
                  {project.priority}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--fg-2)] mt-1.5 leading-relaxed m-0">
              {project.subtitle}
            </p>
          </div>

          {/* Status & Path Controls */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg border border-[var(--line)] bg-[var(--bg)]">
            <div>
              <label className="text-[10px] font-mono text-[var(--fg-3)] uppercase block mb-1">
                Status
              </label>
              <select
                value={project.status}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    status: e.target.value as ProjectStatus,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="w-full bg-[var(--surface)] border border-[var(--line)] rounded px-2.5 py-1 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="backlog">Backlog</option>
                <option value="planned">Planned</option>
                <option value="spike">Exploring</option>
                <option value="in_progress">In Progress</option>
                <option value="polishing">Polishing</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--fg-3)] uppercase block mb-1">
                Priority Tier
              </label>
              <select
                value={project.priority}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    priority: e.target.value as PriorityLevel,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="w-full bg-[var(--surface)] border border-[var(--line)] rounded px-2.5 py-1 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="P0">P0 - Blocker / Core Path</option>
                <option value="P1">P1 - High Priority</option>
                <option value="P2">P2 - Standard Roadmap</option>
                <option value="P3">P3 - Nice to have</option>
              </select>
            </div>
          </div>

          {/* Repo Path & External Links */}
          {(project.path || (project.upstreamRefs && project.upstreamRefs.length > 0)) && (
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[var(--fg-3)] uppercase block">
                Local Workspace & References
              </label>
              <div className="space-y-1.5">
                {project.path && (
                  <div className="flex items-center justify-between p-2 rounded border border-[var(--line)] bg-[var(--bg)] font-mono text-xs">
                    <span className="flex items-center gap-2 text-[var(--fg-2)] truncate">
                      <FolderGit2 className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                      <span className="truncate">{project.path}</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(project.path!, 'path')}
                      className="p-1 rounded text-[var(--fg-3)] hover:text-[var(--fg)] transition ml-2 cursor-pointer"
                      title="Copy path"
                    >
                      {copiedCmd === 'path' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
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
                    className="flex items-center justify-between p-2 rounded border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--line-2)] font-mono text-xs text-[var(--fg-2)] hover:text-[var(--fg)] transition group"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-[var(--fg-3)] group-hover:text-[var(--accent)] transition" />
                      <span>{ref.name}</span>
                    </span>
                    <span className="text-[11px] text-[var(--fg-3)] truncate max-w-[200px]">
                      {ref.url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          <div>
            <label className="text-[10px] font-mono text-[var(--fg-3)] uppercase block mb-2">
              Tech Stack & Tooling
            </label>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--bg)] text-[var(--fg-2)] border border-[var(--line)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Dev Commands */}
          {project.commands && project.commands.length > 0 && (
            <div>
              <label className="text-[10px] font-mono text-[var(--fg-3)] uppercase block mb-2">
                Terminal Commands
              </label>
              <div className="space-y-1.5">
                {project.commands.map((cmd) => (
                  <div
                    key={cmd.cmd}
                    className="flex items-center justify-between p-2 rounded border border-[var(--line)] bg-[var(--bg)] font-mono text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Terminal className="h-3.5 w-3.5 text-[var(--fg-3)] flex-shrink-0" />
                      <span className="text-[var(--fg-3)]">{cmd.label}:</span>
                      <span className="text-[var(--fg)] truncate">{cmd.cmd}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cmd.cmd, cmd.cmd)}
                      className="p-1 rounded text-[var(--fg-3)] hover:text-[var(--fg)] transition ml-2 cursor-pointer"
                      title="Copy command"
                    >
                      {copiedCmd === cmd.cmd ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono text-[var(--fg-3)] uppercase block">
                Milestones & Deliverables ({completedMilestones}/{totalMilestones})
              </label>
              <span className="text-[11px] font-mono text-[var(--accent)] font-medium">
                {progressPct}%
              </span>
            </div>

            <div className="slop-progress-track mb-3">
              <div
                className="slop-progress-fill"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: progressPct === 100 ? '#a855f7' : 'var(--accent)',
                }}
              />
            </div>

            <div className="space-y-1.5">
              {project.milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  className={`flex items-start gap-2.5 p-2 rounded border transition cursor-pointer select-none ${
                    m.completed
                      ? 'border-[var(--line)] bg-[var(--bg)] opacity-60'
                      : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-2)] hover:bg-[var(--hover)]'
                  }`}
                >
                  {m.completed ? (
                    <CheckSquare className="h-4 w-4 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="h-4 w-4 text-[var(--fg-3)] flex-shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`text-xs leading-relaxed ${
                      m.completed ? 'line-through text-[var(--fg-3)]' : 'text-[var(--fg)]'
                    }`}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Notes & Scratchpad */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono text-[var(--fg-3)] uppercase block">
                Notes & Architecture Decisions
              </label>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  <Save className="h-3 w-3" />
                  <span>Save</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={5}
                className="w-full bg-[var(--bg)] border border-[var(--line-2)] rounded-lg p-3 text-xs text-[var(--fg)] font-mono leading-relaxed focus:outline-none focus:border-[var(--accent)]"
                placeholder="Log thoughts, architectural findings, or scratchpad notes..."
              />
            ) : (
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg-2)] leading-relaxed whitespace-pre-wrap font-mono">
                {project.notes || (
                  <span className="text-[var(--fg-3)] italic">No notes logged yet.</span>
                )}
              </div>
            )}
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
