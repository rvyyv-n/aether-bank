import React, { useState } from 'react';
import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';
import { X, FolderGit2, ExternalLink, Copy, Check, Terminal, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { PRIORITY_META, progressOf } from '../data/status';
import { StatusOptions, ProgressBar } from './ui';
import { InlineText } from './InlineText';

const getNowIso = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const Section: React.FC<{ label: string; aside?: React.ReactNode; children: React.ReactNode }> = ({
  label,
  aside,
  children,
}) => (
  <section className="drawer-section">
    <div className="section-head">
      <h3>{label}</h3>
      {aside}
    </div>
    {children}
  </section>
);

const RowDelete: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} className="row-action hover:!text-rose-500" title={label} aria-label={label}>
    <X className="h-3.5 w-3.5" />
  </button>
);

/** Every editable field of a project, shared by the slide-over and the full page. */
export const ProjectBody: React.FC<{
  project: ProjectIdea;
  categories: string[];
  onUpdateProject: (updated: ProjectIdea) => void;
}> = ({ project, categories, onUpdateProject }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const update = (patch: Partial<ProjectIdea>) =>
    onUpdateProject({ ...project, ...patch, updatedAt: getNowIso() });

  const optional = (s: string) => (s ? s : undefined);

  // Milestones
  const milestones = project.milestones;
  const setMilestones = (next: ProjectIdea['milestones']) => update({ milestones: next });
  const moveMilestone = (idx: number, by: number) => {
    const next = [...milestones];
    const [m] = next.splice(idx, 1);
    next.splice(idx + by, 0, m);
    setMilestones(next);
  };

  // Links and commands
  const refs = project.upstreamRefs ?? [];
  const commands = project.commands ?? [];

  const { done, total, pct } = progressOf(project);

  return (
    <div>
      <datalist id="project-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
        {/* Title */}
        <h2 id="drawer-title" className="m-0">
          <InlineText
            value={project.title}
            onCommit={(v) => update({ title: v || project.title })}
            ariaLabel="Title"
            className="text-[22px] font-medium tracking-tight text-[var(--fg)]"
          />
        </h2>
        <InlineText
          value={project.subtitle}
          onCommit={(v) => update({ subtitle: v })}
          placeholder="One-line summary"
          ariaLabel="One-liner"
          className="mt-1 text-[13.5px] text-[var(--fg-2)]"
        />

        {/* Status, priority, licence, path */}
        <div className="drawer-props">
          <label>
            <span>Status</span>
            <select
              value={project.status}
              onChange={(e) => update({ status: e.target.value as ProjectStatus })}
              className="prop-select"
            >
              <StatusOptions />
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select
              value={project.priority}
              onChange={(e) => update({ priority: e.target.value as PriorityLevel })}
              className="prop-select"
            >
              {(Object.keys(PRIORITY_META) as PriorityLevel[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_META[p]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Licence</span>
            <InlineText
              value={project.license ?? ''}
              onCommit={(v) => update({ license: optional(v) })}
              placeholder="None"
              ariaLabel="Licence"
            />
          </label>
          <div className="prop-wide">
            <span>Repo path</span>
            <div className="flex items-center gap-1 min-w-0">
              <InlineText
                value={project.path ?? ''}
                onCommit={(v) => update({ path: optional(v) })}
                placeholder="Not on disk yet"
                ariaLabel="Repo path"
                className="font-mono text-[13px]"
              />
              {project.path && (
                <button
                  onClick={() => copyToClipboard(project.path!, 'path')}
                  className="row-action !opacity-100"
                  title="Copy path"
                  aria-label="Copy path"
                >
                  {copied === 'path' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <FolderGit2 className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <Section label="About">
          <InlineText
            multiline
            value={project.description}
            onCommit={(v) => update({ description: v })}
            placeholder="What is it and why does it matter?"
            ariaLabel="Description"
            className="text-[13px] leading-relaxed text-[var(--fg-2)]"
          />
          <div className="mt-3 mb-0.5 text-[12px] text-[var(--fg-3)]">Problem</div>
          <InlineText
            multiline
            value={project.problemStatement ?? ''}
            onCommit={(v) => update({ problemStatement: optional(v) })}
            placeholder="What problem does it solve?"
            ariaLabel="Problem statement"
            className="text-[13px] leading-relaxed text-[var(--fg-2)]"
          />
        </Section>

        {/* Milestones */}
        <Section
          label="Milestones"
          aside={
            <span className="row-count">
              {done}/{total} · {pct}%
            </span>
          }
        >
          <ProgressBar pct={pct} className="mb-2" />
          <div>
            {milestones.map((m, idx) => (
              <div key={m.id} className="edit-row">
                <button
                  onClick={() =>
                    setMilestones(milestones.map((x) => (x.id === m.id ? { ...x, completed: !x.completed } : x)))
                  }
                  role="checkbox"
                  aria-checked={m.completed}
                  aria-label={m.completed ? 'Mark not done' : 'Mark done'}
                  className={`check ${m.completed ? 'checked' : ''}`}
                >
                  {m.completed && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </button>
                <InlineText
                  value={m.text}
                  onCommit={(v) =>
                    v
                      ? setMilestones(milestones.map((x) => (x.id === m.id ? { ...x, text: v } : x)))
                      : setMilestones(milestones.filter((x) => x.id !== m.id))
                  }
                  ariaLabel="Milestone"
                  className={`text-[13px] ${m.completed ? 'line-through text-[var(--fg-3)]' : 'text-[var(--fg)]'}`}
                />
                <span className="row-actions">
                  {idx > 0 && (
                    <button onClick={() => moveMilestone(idx, -1)} className="row-action" aria-label="Move up" title="Move up">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {idx < milestones.length - 1 && (
                    <button onClick={() => moveMilestone(idx, 1)} className="row-action" aria-label="Move down" title="Move down">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <RowDelete label="Remove milestone" onClick={() => setMilestones(milestones.filter((x) => x.id !== m.id))} />
                </span>
              </div>
            ))}
            <div className="edit-row">
              <Plus className="h-3.5 w-3.5 text-[var(--fg-3)] flex-shrink-0" />
              <InlineText
                value=""
                clearOnCommit
                onCommit={(v) => v && setMilestones([...milestones, { id: newId('m'), text: v, completed: false }])}
                placeholder="Add a milestone"
                ariaLabel="New milestone"
                className="text-[13px]"
              />
            </div>
          </div>
        </Section>

        {/* Commands */}
        <Section label="Commands">
          {commands.map((c, idx) => (
            <div key={idx} className="edit-row">
              <Terminal className="h-3.5 w-3.5 text-[var(--fg-3)] flex-shrink-0" />
              <InlineText
                value={c.label}
                onCommit={(v) => update({ commands: commands.map((x, i) => (i === idx ? { ...x, label: v } : x)) })}
                placeholder="Label"
                ariaLabel="Command label"
                className="!w-[110px] flex-shrink-0 text-[13px] text-[var(--fg-3)]"
              />
              <InlineText
                value={c.cmd}
                onCommit={(v) =>
                  update({
                    commands: v
                      ? commands.map((x, i) => (i === idx ? { ...x, cmd: v } : x))
                      : commands.filter((_, i) => i !== idx),
                  })
                }
                ariaLabel="Command"
                className="font-mono text-[13px] text-[var(--fg)]"
              />
              <button
                onClick={() => copyToClipboard(c.cmd, `cmd-${idx}`)}
                className="row-action !opacity-100"
                title="Copy command"
                aria-label="Copy command"
              >
                {copied === `cmd-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <span className="row-actions">
                <RowDelete label="Remove command" onClick={() => update({ commands: commands.filter((_, i) => i !== idx) })} />
              </span>
            </div>
          ))}
          <div className="edit-row">
            <Plus className="h-3.5 w-3.5 text-[var(--fg-3)] flex-shrink-0" />
            <InlineText
              value=""
              clearOnCommit
              onCommit={(v) => v && update({ commands: [...commands, { label: commands.length ? 'Run' : 'Dev', cmd: v }] })}
              placeholder="Add a command, e.g. npm run dev"
              ariaLabel="New command"
              className="font-mono text-[13px]"
            />
          </div>
        </Section>

        {/* Links */}
        <Section label="Links">
          {refs.map((r, idx) => (
            <div key={idx} className="edit-row">
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="row-action !opacity-100 hover:!text-[var(--accent)]"
                title={`Open ${r.url}`}
                aria-label={`Open ${r.name}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <InlineText
                value={r.name}
                onCommit={(v) => update({ upstreamRefs: refs.map((x, i) => (i === idx ? { ...x, name: v || x.name } : x)) })}
                ariaLabel="Link name"
                className="!w-[130px] flex-shrink-0 text-[13.5px] text-[var(--fg)]"
              />
              <InlineText
                value={r.url}
                onCommit={(v) =>
                  update({
                    upstreamRefs: v
                      ? refs.map((x, i) => (i === idx ? { ...x, url: v } : x))
                      : refs.filter((_, i) => i !== idx),
                  })
                }
                ariaLabel="Link URL"
                className="font-mono text-[11.5px] text-[var(--fg-3)]"
              />
              <span className="row-actions">
                <RowDelete label="Remove link" onClick={() => update({ upstreamRefs: refs.filter((_, i) => i !== idx) })} />
              </span>
            </div>
          ))}
          <div className="edit-row">
            <Plus className="h-3.5 w-3.5 text-[var(--fg-3)] flex-shrink-0" />
            <InlineText
              value=""
              clearOnCommit
              onCommit={(v) => {
                if (!v) return;
                const url = /^[a-z]+:\/\//i.test(v) ? v : `https://${v}`;
                let name = 'Link';
                try {
                  name = new URL(url).hostname.replace(/^www\./, '');
                } catch {
                  /* keep the default name */
                }
                update({ upstreamRefs: [...refs, { name, url }] });
              }}
              placeholder="Paste a URL"
              ariaLabel="New link"
              className="font-mono text-[11.5px]"
            />
          </div>
        </Section>

        {/* Tech */}
        <Section label="Tech stack">
          <div className="flex flex-wrap items-center gap-1.5">
            {project.techStack.map((tech) => (
              <span key={tech} className="tag tag-removable">
                {tech}
                <button
                  onClick={() => update({ techStack: project.techStack.filter((t) => t !== tech) })}
                  aria-label={`Remove ${tech}`}
                  title={`Remove ${tech}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <InlineText
              value=""
              clearOnCommit
              onCommit={(v) => {
                const add = v.split(',').map((t) => t.trim()).filter((t) => t && !project.techStack.includes(t));
                if (add.length) update({ techStack: [...project.techStack, ...add] });
              }}
              placeholder="Add tech"
              ariaLabel="Add tech"
              className="!w-[110px] text-[11.5px]"
            />
          </div>
        </Section>

        {/* Architecture */}
        <Section label="Architecture">
          <InlineText
            multiline
            value={project.architectureNotes ?? ''}
            onCommit={(v) => update({ architectureNotes: optional(v) })}
            placeholder="How is it built?"
            ariaLabel="Architecture notes"
            className="text-[13px] leading-relaxed text-[var(--fg-2)]"
          />
        </Section>

        {/* Notes */}
        <Section label="Notes" aside={<span className="hint">Ctrl+Enter saves</span>}>
          <InlineText
            multiline
            value={project.notes ?? ''}
            onCommit={(v) => update({ notes: v })}
            placeholder="Thoughts, findings, decisions..."
            ariaLabel="Notes"
            className="font-mono text-[13px] leading-relaxed text-[var(--fg-2)] min-h-[64px]"
          />
        </Section>

        <div className="pt-6 text-[12px] text-[var(--fg-3)]">Updated {formatDate(project.updatedAt)}</div>
    </div>
  );
};
