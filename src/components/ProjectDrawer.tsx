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
  GitFork, 
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

export const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
  project,
  onClose,
  onUpdateProject,
  onDeleteProject,
}) => {
  if (!project) return null;

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
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveNotes = () => {
    onUpdateProject({
      ...project,
      notes: notesValue,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingNotes(false);
  };

  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-xl bg-[var(--bg-surface)] border-l border-[var(--border-main)] h-full overflow-y-auto flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[var(--bg-surface)] px-5 py-3.5 border-b border-[var(--border-main)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-page)] px-2 py-0.5 rounded border border-[var(--border-main)]">
              {project.category}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">· {project.id}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (confirm(`Delete "${project.title}" from Banker?`)) {
                  onDeleteProject(project.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Header Title & Subtitle */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] m-0">
              {project.title}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              {project.subtitle}
            </p>
          </div>

          {/* Quick Property Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-main)]">
            <div>
              <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block mb-1">Status</span>
              <select
                value={project.status}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    status: e.target.value as ProjectStatus,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="text-xs font-mono py-1 px-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none w-full"
              >
                <option value="backlog">Backlog</option>
                <option value="planned">Planned</option>
                <option value="spike">Spike</option>
                <option value="in_progress">In Progress</option>
                <option value="polishing">Polishing</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block mb-1">Priority</span>
              <select
                value={project.priority}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    priority: e.target.value as PriorityLevel,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="text-xs font-mono py-1 px-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none w-full"
              >
                <option value="P0">P0 (Urgent)</option>
                <option value="P1">P1 (High)</option>
                <option value="P2">P2 (Medium)</option>
                <option value="P3">P3 (Low)</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block mb-1">License</span>
              <span className="text-xs font-mono text-[var(--text-secondary)] block py-1">
                {project.license || 'TBD'}
              </span>
            </div>

            <div>
              <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block mb-1">Updated</span>
              <span className="text-xs font-mono text-[var(--text-secondary)] block py-1">
                {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Location & Thread ID */}
          {(project.path || project.threadId) && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block">Links</span>
              <div className="space-y-1.5">
                {project.path && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-main)] font-mono text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-primary)] truncate">
                      <FolderGit2 className="h-3.5 w-3.5 text-[var(--text-secondary)] flex-shrink-0" />
                      <span className="truncate text-[11px]">{project.path}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(project.path!, 'path')}
                      className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      title="Copy path"
                    >
                      {copiedCmd === 'path' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                )}

                {project.threadId && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-main)] font-mono text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-primary)] truncate">
                      <GitFork className="h-3.5 w-3.5 text-[var(--text-secondary)] flex-shrink-0" />
                      <span className="text-[var(--text-muted)] text-[11px]">T3:</span>
                      <span className="truncate text-[11px]">{project.threadId}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(project.threadId!, 'thread')}
                      className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      title="Copy Thread ID"
                    >
                      {copiedCmd === 'thread' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">Tech Stack</span>
            <div className="flex flex-wrap gap-1">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-secondary)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Overview & Problem Statement */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Overview</span>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-page)] p-3 rounded-lg border border-[var(--border-main)]">
                {project.description}
              </p>
            </div>

            {project.problemStatement && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Problem & Rationale</span>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-page)] p-3 rounded-lg border border-[var(--border-main)]">
                  {project.problemStatement}
                </p>
              </div>
            )}

            {project.architectureNotes && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Architecture</span>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-page)] p-3 rounded-lg border border-[var(--border-main)]">
                  {project.architectureNotes}
                </p>
              </div>
            )}
          </div>

          {/* Milestones Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Milestones & Checklist
              </span>
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                {completedMilestones}/{totalMilestones} ({progressPct}%)
              </span>
            </div>

            <div className="w-full bg-[var(--bg-page)] h-1 rounded-full overflow-hidden mb-2.5 border border-[var(--border-main)]">
              <div
                className="h-full bg-[var(--text-primary)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-1">
              {project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => toggleMilestone(milestone.id)}
                  className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition text-xs select-none ${
                    milestone.completed
                      ? 'bg-[var(--bg-page)] text-[var(--text-muted)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-main)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0 text-[var(--text-primary)]">
                    {milestone.completed ? (
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Square className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    )}
                  </div>
                  <span className={milestone.completed ? 'line-through text-[var(--text-muted)]' : ''}>
                    {milestone.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Commands */}
          {project.commands && project.commands.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">
                Commands
              </span>
              <div className="space-y-1.5">
                {project.commands.map((cmd) => (
                  <div
                    key={cmd.label}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-main)] font-mono text-xs"
                  >
                    <div className="flex items-center gap-2 text-[var(--text-primary)] truncate">
                      <Terminal className="h-3 w-3 text-[var(--text-secondary)] flex-shrink-0" />
                      <span className="text-[var(--text-muted)] text-[10px]">{cmd.label}:</span>
                      <span className="text-[11px] truncate">{cmd.cmd}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cmd.cmd, cmd.label)}
                      className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                      title="Copy command"
                    >
                      {copiedCmd === cmd.label ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upstream References */}
          {project.upstreamRefs && project.upstreamRefs.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">
                Upstream & References
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {project.upstreamRefs.map((ref) => (
                  <a
                    key={ref.name}
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[var(--bg-page)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] transition flex items-center justify-between text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] group"
                  >
                    <span className="truncate text-[11px]">{ref.name}</span>
                    <ExternalLink className="h-3 w-3 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes / Scratchpad */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Scratchpad
              </span>
              {isEditingNotes ? (
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 text-xs text-[var(--text-primary)] hover:underline font-medium"
                >
                  <Save className="h-3 w-3" />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={4}
                className="w-full bg-[var(--bg-page)] border border-[var(--border-main)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                placeholder="Thoughts, notes, or ideas..."
              />
            ) : (
              <div className="p-2.5 bg-[var(--bg-page)] rounded-lg border border-[var(--border-main)] text-xs text-[var(--text-secondary)] whitespace-pre-wrap min-h-[50px]">
                {project.notes || 'No notes yet. Click edit to add.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
