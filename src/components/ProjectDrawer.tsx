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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-2xl bg-[#0c0e17] border-l border-white/10 h-full overflow-y-auto flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#0c0e17]/90 backdrop-blur-md px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
              {project.category}
            </span>
            <span className="text-xs font-mono text-zinc-500">· {project.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
                  onDeleteProject(project.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Header Title & Subtitle */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white m-0">
              {project.title}
            </h2>
            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
              {project.subtitle}
            </p>
          </div>

          {/* Quick Property Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Status</span>
              <select
                value={project.status}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    status: e.target.value as ProjectStatus,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="text-xs font-medium py-1 px-2 rounded bg-zinc-900 border border-zinc-700 text-cyan-400 focus:outline-none w-full"
              >
                <option value="backlog">Backlog</option>
                <option value="planned">Planned</option>
                <option value="spike">Spike / R&D</option>
                <option value="in_progress">In Progress</option>
                <option value="polishing">Polishing</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Priority</span>
              <select
                value={project.priority}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    priority: e.target.value as PriorityLevel,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="text-xs font-medium py-1 px-2 rounded bg-zinc-900 border border-zinc-700 text-white focus:outline-none w-full"
              >
                <option value="P0">P0 (Urgent)</option>
                <option value="P1">P1 (High)</option>
                <option value="P2">P2 (Medium)</option>
                <option value="P3">P3 (Low)</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">License</span>
              <span className="text-xs font-mono text-zinc-300 block py-1">
                {project.license || 'Proprietary / TBD'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Last Updated</span>
              <span className="text-xs font-mono text-zinc-400 block py-1">
                {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Location & Thread ID */}
          {(project.path || project.threadId) && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">Workspace Links</span>
              <div className="space-y-2">
                {project.path && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 border border-white/5 font-mono text-xs">
                    <div className="flex items-center gap-2 text-zinc-300 truncate">
                      <FolderGit2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{project.path}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(project.path!, 'path')}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="Copy path"
                    >
                      {copiedCmd === 'path' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {project.threadId && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 border border-white/5 font-mono text-xs">
                    <div className="flex items-center gap-2 text-zinc-300 truncate">
                      <GitFork className="h-4 w-4 text-purple-400 flex-shrink-0" />
                      <span className="text-zinc-500">T3 Thread:</span>
                      <span className="truncate text-purple-300">{project.threadId}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(project.threadId!, 'thread')}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="Copy Thread ID"
                    >
                      {copiedCmd === 'thread' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">Technology Stack</span>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Description & Problem Statement */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Overview</span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-3.5 rounded-lg border border-white/5">
                {project.description}
              </p>
            </div>

            {project.problemStatement && (
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Problem / Rationale</span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-3.5 rounded-lg border border-white/5">
                  {project.problemStatement}
                </p>
              </div>
            )}

            {project.architectureNotes && (
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Architecture & Key Decisions</span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-3.5 rounded-lg border border-white/5">
                  {project.architectureNotes}
                </p>
              </div>
            )}
          </div>

          {/* Milestones & Feature Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Milestones & Feature Checklist
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {completedMilestones}/{totalMilestones} ({progressPct}%)
              </span>
            </div>

            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-3 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-1.5">
              {project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => toggleMilestone(milestone.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs select-none ${
                    milestone.completed
                      ? 'bg-emerald-500/5 text-zinc-400 hover:bg-emerald-500/10'
                      : 'bg-zinc-950/60 text-zinc-200 hover:bg-zinc-900 border border-white/5'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0 text-cyan-400">
                    {milestone.completed ? (
                      <CheckSquare className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-600" />
                    )}
                  </div>
                  <span className={milestone.completed ? 'line-through text-zinc-500' : ''}>
                    {milestone.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Commands */}
          {project.commands && project.commands.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                Quick Terminal Commands
              </span>
              <div className="space-y-2">
                {project.commands.map((cmd) => (
                  <div
                    key={cmd.label}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-white/5 font-mono text-xs"
                  >
                    <div className="flex items-center gap-2 text-zinc-300 truncate">
                      <Terminal className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-zinc-500">{cmd.label}:</span>
                      <span className="text-zinc-200 truncate">{cmd.cmd}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cmd.cmd, cmd.label)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                      title="Copy command"
                    >
                      {copiedCmd === cmd.label ? (
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

          {/* Upstream References */}
          {project.upstreamRefs && project.upstreamRefs.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                Upstream & Reference Repos
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.upstreamRefs.map((ref) => (
                  <a
                    key={ref.name}
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-lg bg-zinc-950/60 hover:bg-zinc-900 border border-white/5 transition flex items-center justify-between text-xs text-zinc-300 hover:text-white group"
                  >
                    <span className="truncate">{ref.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-500 group-hover:text-cyan-400 transition flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes / Scratchpad */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Notes & Brainstorming
              </span>
              {isEditingNotes ? (
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-medium"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={4}
                className="w-full bg-zinc-950 border border-cyan-500/50 rounded-lg p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="Add thoughts, architectural decisions, or links..."
              />
            ) : (
              <div className="p-3 bg-zinc-950/40 rounded-lg border border-white/5 text-xs text-zinc-400 whitespace-pre-wrap min-h-[60px]">
                {project.notes || 'No custom notes yet. Click edit to add ideas.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
