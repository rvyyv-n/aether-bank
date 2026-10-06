import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import type { ProjectIdea } from '../types';
import { STATUS_META } from '../data/status';
import { StatusDot } from './ui';

export interface PaletteCommand {
  id: string;
  label: string;
  group: 'Go to' | 'Actions';
  hint?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  projects: ProjectIdea[];
  commands: PaletteCommand[];
  onSelectProject: (project: ProjectIdea) => void;
}

type Item =
  | { kind: 'project'; key: string; project: ProjectIdea; score: number }
  | { kind: 'command'; key: string; command: PaletteCommand; score: number };

/** Subsequence match; lower is better, -1 means no match. Word starts and runs score best. */
function matchScore(query: string, text: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct !== -1) return direct === 0 || t[direct - 1] === ' ' ? 0 : 1 + direct / 100;
  let ti = 0;
  let gaps = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    gaps += found - ti;
    ti = found + 1;
  }
  return 2 + gaps / 10;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  projects,
  commands,
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<Item[]>(() => {
    const q = query.trim();
    const projectItems: Item[] = projects
      .map((project) => ({
        kind: 'project' as const,
        key: `p-${project.id}`,
        project,
        score: Math.min(
          ...[project.title, project.category, project.subtitle, ...project.techStack]
            .map((t, i) => {
              const s = matchScore(q, t);
              return s === -1 ? Infinity : s + (i === 0 ? 0 : 3);
            })
        ),
      }))
      .filter((i) => i.score !== Infinity);
    const commandItems: Item[] = commands
      .map((command) => ({
        kind: 'command' as const,
        key: `c-${command.id}`,
        command,
        score: matchScore(q, command.label),
      }))
      .filter((i) => i.score !== -1);
    if (!q) {
      const inGroup = (g: PaletteCommand['group']) =>
        commandItems.filter((i) => i.kind === 'command' && i.command.group === g);
      return [...inGroup('Go to'), ...projectItems, ...inGroup('Actions')];
    }
    return [...projectItems, ...commandItems].sort((a, b) => a.score - b.score);
  }, [query, projects, commands]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const runItem = (item: Item | undefined) => {
    if (!item) return;
    onClose();
    if (item.kind === 'project') onSelectProject(item.project);
    else item.command.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runItem(items[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  // Section labels appear where the group changes
  const groupOf = (i: Item) => (i.kind === 'project' ? 'Projects' : i.command.group);

  return (
    <div className="fixed inset-0 z-[70] backdrop flex items-start justify-center px-3 pt-[12vh]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick switcher"
        className="palette modal-panel"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="search palette-search">
          <Search className="h-4 w-4 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Jump to a project, view or action"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={items[active] ? `palette-${items[active].key}` : undefined}
          />
          <kbd>esc</kbd>
        </div>

        <div className="palette-list" id="palette-list" role="listbox" ref={listRef}>
          {items.length === 0 && <p className="side-note px-2 py-6 text-center">No matches for “{query}”</p>}
          {items.map((item, idx) => {
            const showGroup = idx === 0 || groupOf(items[idx - 1]) !== groupOf(item);
            return (
              <React.Fragment key={item.key}>
                {showGroup && !query && <div className="palette-group">{groupOf(item)}</div>}
                <button
                  id={`palette-${item.key}`}
                  data-index={idx}
                  role="option"
                  aria-selected={idx === active}
                  className="palette-item"
                  onMouseMove={() => setActive(idx)}
                  onClick={() => runItem(item)}
                >
                  {item.kind === 'project' ? (
                    <>
                      <StatusDot status={item.project.status} className="w-[7px] h-[7px]" />
                      <span className="truncate">{item.project.title}</span>
                      <span className="palette-meta truncate">{item.project.category}</span>
                      <span className="palette-hint">{STATUS_META[item.project.status].label}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-[7px]" />
                      <span className="truncate">{item.command.label}</span>
                      {query && <span className="palette-meta">{item.command.group}</span>}
                      {item.command.hint && <kbd className="palette-hint">{item.command.hint}</kbd>}
                    </>
                  )}
                  {idx === active && <CornerDownLeft className="h-3 w-3 text-[var(--fg-3)] flex-shrink-0" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
