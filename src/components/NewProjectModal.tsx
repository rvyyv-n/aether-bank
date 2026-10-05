import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: ProjectIdea) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Utility');
  const [status, setStatus] = useState<ProjectStatus>('backlog');
  const [priority, setPriority] = useState<PriorityLevel>('P2');
  const [techStackInput, setTechStackInput] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const techStack = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const milestones = milestonesInput
      .split('\n')
      .map((line, idx) => ({
        id: `m_${Date.now()}_${idx}`,
        text: line.trim(),
        completed: false,
      }))
      .filter((m) => m.text.length > 0);

    const newProject: ProjectIdea = {
      id,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Custom Idea',
      category: category.trim() || 'General',
      status,
      priority,
      techStack: techStack.length > 0 ? techStack : ['Rust', 'Tauri'],
      description: description.trim() || 'Newly logged project idea.',
      milestones: milestones.length > 0 ? milestones : [{ id: 'm1', text: 'Initial scoping and technical spec', completed: false }],
      path: path.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-[#0d0f18] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white m-0">Add New Idea / Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Zen Quick Launcher"
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/70"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Subtitle / Elevator Pitch</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Raycast-style keyboard runner in Rust"
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/70"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. System, Hardware"
                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500/70"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500/70"
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
              <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500/70"
              >
                <option value="P0">P0 (Urgent)</option>
                <option value="P1">P1 (High)</option>
                <option value="P2">P2 (Medium)</option>
                <option value="P3">P3 (Low)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Tech Stack (comma separated)</label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="e.g. Rust, Tauri v2, SQLite, Tailwind"
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/70"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Description / Goals</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Core philosophy, architecture thoughts, key dependencies..."
              className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/70"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Milestones (1 per line)</label>
            <textarea
              rows={3}
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              placeholder="Initial spike prototype&#10;Wire up core Rust bindings&#10;Design Mica UI shell"
              className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/70 font-mono"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-mono text-[11px] uppercase mb-1">Workspace Path (Optional)</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g. D:\Code\Repos\zen-launcher"
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/70 font-mono"
            />
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Project Bank</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
