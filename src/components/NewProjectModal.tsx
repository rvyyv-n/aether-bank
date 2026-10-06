import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';
import { X, Plus } from 'lucide-react';
import { BankerLogo } from './BankerLogo';
import { StatusOptions } from './ui';
import { PRIORITY_META } from '../data/status';

interface NewProjectModalProps {
  isOpen: boolean;
  existingIds: string[];
  categories: string[];
  onClose: () => void;
  onAddProject: (project: ProjectIdea) => void;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  existingIds,
  categories,
  onClose,
  onAddProject,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Tools');
  const [status, setStatus] = useState<ProjectStatus>('planned');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [techStackInput, setTechStackInput] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Keep ids unique so a second "Todo app" doesn't overwrite the first
    const base = slugify(title);
    let id = base;
    for (let n = 2; existingIds.includes(id); n++) id = `${base}-${n}`;

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
      subtitle: subtitle.trim() || 'New idea',
      category: category.trim() || 'Tools',
      status,
      priority,
      techStack,
      description: description.trim(),
      milestones: milestones.length > 0 ? milestones : [{ id: `m_${Date.now()}_0`, text: 'Write a first spec', completed: false }],
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto backdrop flex items-start sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-idea-title"
        className="modal-panel w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BankerLogo size={16} className="text-[var(--accent)]" />
            <h3 id="new-idea-title" className="text-[13px] font-semibold text-[var(--fg)] m-0">New idea</h3>
          </div>
          <button onClick={onClose} className="icon-button" aria-label="Close" title="Close (Esc)">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <label className="block">
            <span className="field-label">Title</span>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Zen Quick Launcher"
              className="field !text-sm !py-2"
            />
          </label>

          <label className="block">
            <span className="field-label">One-liner</span>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Keyboard-driven fuzzy file and command palette"
              className="field"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="field-label">Category</span>
              <input
                type="text"
                list="category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="CLI / App"
                className="field"
              />
              <datalist id="category-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="field-label">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="field"
              >
                <StatusOptions only={['planned', 'spike', 'in_progress']} />
              </select>
            </label>
            <label className="block">
              <span className="field-label">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
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

          <label className="block">
            <span className="field-label">Description</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is it and why does it matter?"
              className="field leading-relaxed"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="field-label">Tech stack</span>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="Rust, Tokio, SQLite"
                className="field"
              />
            </label>
            <label className="block">
              <span className="field-label">Repo path</span>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="projects/zen-launcher"
                className="field font-mono"
              />
            </label>
          </div>

          <label className="block">
            <span className="field-label">Milestones <span className="normal-case font-normal tracking-normal">· one per line</span></span>
            <textarea
              rows={3}
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              placeholder={"Project scaffold & CLI args\nFuzzy matching index\nRelease v0.1.0"}
              className="field font-mono leading-relaxed"
            />
          </label>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--line)]">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-accent" disabled={!title.trim()}>
              <Plus className="h-3.5 w-3.5" />
              <span>Add idea</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
