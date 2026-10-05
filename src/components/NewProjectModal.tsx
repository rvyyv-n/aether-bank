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
      subtitle: subtitle.trim() || 'Custom Project Concept',
      category: category.trim() || 'Tooling',
      status,
      priority,
      techStack: techStack.length > 0 ? techStack : ['TypeScript', 'React'],
      description: description.trim() || 'Logged project concept.',
      milestones: milestones.length > 0 ? milestones : [{ id: 'm1', text: 'Initial technical specification', completed: false }],
      path: path.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onAddProject(newProject);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setTechStackInput('');
    setPath('');
    setMilestonesInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface)]">
          <div className="flex items-center gap-2">
            <BankerLogo size={16} className="text-[var(--accent)]" />
            <h3 className="text-xs font-semibold text-[var(--fg)] m-0">Log New Project Idea</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--fg-3)] hover:text-[var(--fg)] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Zen Quick Launcher"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-3 py-1.5 text-[var(--fg)] placeholder-[var(--fg-3)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1">One-line Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Keyboard-driven fuzzy file and command palette"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-3 py-1.5 text-[var(--fg)] placeholder-[var(--fg-3)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="CLI / App"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-2.5 py-1.5 text-[var(--fg)] placeholder-[var(--fg-3)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-2 py-1.5 text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="backlog">Backlog</option>
                <option value="planned">Planned</option>
                <option value="spike">Exploring</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
            <div>
              <label className="block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-2 py-1.5 text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="P0">P0 (Critical)</option>
                <option value="P1">P1 (High)</option>
                <option value="P2">P2 (Standard)</option>
                <option value="P3">P3 (Backburner)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1">Tech Stack (comma separated)</label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="e.g. Rust, Tokio, Ratatui, SQLite"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-3 py-1.5 text-[var(--fg)] placeholder-[var(--fg-3)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1">Local Repo Path (optional)</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g. projects/zen-launcher"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-3 py-1.5 text-[var(--fg)] placeholder-[var(--fg-3)] font-mono focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-[var(--fg-3)] font-mono text-[10.5px] uppercase mb-1">Milestones (one per line)</label>
            <textarea
              rows={3}
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              placeholder={"Project scaffold & CLI args\nFuzzy matching index\nRelease v0.1.0"}
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-md px-3 py-1.5 text-[var(--fg)] placeholder-[var(--fg-3)] focus:outline-none focus:border-[var(--accent)] font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-[var(--line)] hover:border-[var(--line-2)] text-[var(--fg-2)] hover:text-[var(--fg)] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-accent cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
