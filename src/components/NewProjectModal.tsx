import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';
import { X, Plus } from 'lucide-react';
import { BankerLogo } from './BankerLogo';

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
  const [category, setCategory] = useState('System');
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
      subtitle: subtitle.trim() || 'Custom Project Idea',
      category: category.trim() || 'General',
      status,
      priority,
      techStack: techStack.length > 0 ? techStack : ['Rust', 'Tauri v2'],
      description: description.trim() || 'Logged project concept.',
      milestones: milestones.length > 0 ? milestones : [{ id: 'm1', text: 'Initial technical specification', completed: false }],
      path: path.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-[var(--text-primary)] text-[var(--bg-surface)] flex items-center justify-center">
              <BankerLogo size={14} />
            </div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] m-0">New Project / Idea</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[var(--text-secondary)] font-mono text-[10px] uppercase mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Zen Quick Launcher"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-mono text-xs uppercase mb-1.5">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Minimal keyboard runner in Rust"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[var(--text-secondary)] font-mono text-xs uppercase mb-1.5">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="System"
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-mono text-xs uppercase mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
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
              <label className="block text-[var(--text-secondary)] font-mono text-xs uppercase mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
              >
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-mono text-xs uppercase mb-1.5">Tech Stack (comma separated)</label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="Rust, Tauri v2, Tailwind"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-mono text-xs uppercase mb-1.5">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does it do? Key technical decisions..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-mono text-xs uppercase mb-1.5">Milestones (1 per line)</label>
            <textarea
              rows={2}
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              placeholder="Scaffold repository&#10;Implement core logic"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-mono text-xs uppercase mb-1.5">Path (Optional)</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="D:\Code\Repos\zen-launcher"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] font-mono"
            />
          </div>

          <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-surface)] font-medium hover:opacity-90 transition flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
