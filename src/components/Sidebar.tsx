import React from 'react';
import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';
import { Search, X } from 'lucide-react';
import { STATUS_META, PRIORITY_META, progressOf } from '../data/status';
import { StatusDot } from './ui';

export type Section = 'vault' | 'roadmap' | 'analytics' | 'usage';

interface SidebarProps {
  section: Section;
  /** The Usage page renders its own sidebar content into this element */
  slotRef: (el: HTMLElement | null) => void;
  projects: ProjectIdea[];
  filteredProjects: ProjectIdea[];
  filteredCount: number;
  totalCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  hiddenStatuses: ProjectStatus[];
  setHiddenStatuses: (s: ProjectStatus[]) => void;
  hiddenPriorities: PriorityLevel[];
  setHiddenPriorities: (p: PriorityLevel[]) => void;
  hiddenCategories: string[];
  setHiddenCategories: (c: string[]) => void;
  selectedProjectId: string | null;
  onSelectProject: (project: ProjectIdea) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onResetFilters: () => void;
  onExportJson: () => void;
  onResetData: () => void;
}

const PRIORITIES: PriorityLevel[] = ['P0', 'P1', 'P2', 'P3'];

// Active work first in the filter list
const STATUS_FILTER_ORDER: ProjectStatus[] = ['in_progress', 'spike', 'planned', 'polishing', 'shipped', 'backlog'];

/** Click switches one value off or on; double-click shows only that value. */
function makeToggle<T>(all: T[], hidden: T[], setHidden: (next: T[]) => void) {
  return {
    onClick: (v: T) =>
      setHidden(hidden.includes(v) ? hidden.filter((h) => h !== v) : [...hidden, v]),
    onDoubleClick: (v: T) => {
      const onlyThis = hidden.length === all.length - 1 && !hidden.includes(v);
      setHidden(onlyThis ? [] : all.filter((a) => a !== v));
    },
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  section,
  slotRef,
  projects,
  filteredProjects,
  filteredCount,
  totalCount,
  searchQuery,
  setSearchQuery,
  hiddenStatuses,
  setHiddenStatuses,
  hiddenPriorities,
  setHiddenPriorities,
  hiddenCategories,
  setHiddenCategories,
  selectedProjectId,
  onSelectProject,
  isOpenMobile,
  onCloseMobile,
  onResetFilters,
  onExportJson,
  onResetData,
}) => {
  const categories = Array.from(new Set(projects.map((p) => p.category))).sort();
  const hasActiveFilters =
    searchQuery !== '' ||
    hiddenStatuses.length > 0 ||
    hiddenPriorities.length > 0 ||
    hiddenCategories.length > 0;

  const statusToggle = makeToggle(STATUS_FILTER_ORDER, hiddenStatuses, setHiddenStatuses);
  const priorityToggle = makeToggle(PRIORITIES, hiddenPriorities, setHiddenPriorities);
  const categoryToggle = makeToggle(categories, hiddenCategories, setHiddenCategories);

  if (section === 'usage') {
    return (
      <aside className={`sidebar ${isOpenMobile ? 'open' : ''}`} aria-label="Usage filters">
        {isOpenMobile && (
          <button onClick={onCloseMobile} className="icon-button md:hidden" aria-label="Close filters">
            <X className="h-4 w-4" />
          </button>
        )}
        <div ref={slotRef} />
      </aside>
    );
  }

  const showSearch = section === 'vault' || section === 'roadmap';
  const showPriority = section !== 'roadmap';
  const showDirectory = section === 'vault' || section === 'roadmap';

  return (
    <aside className={`sidebar ${isOpenMobile ? 'open' : ''}`} aria-label="Filters and projects">
      <div className="side-heading">
        <h2>
          {section === 'analytics' ? 'Filters' : 'Projects'}
          <span>
            {filteredCount !== totalCount ? `${filteredCount} of ${totalCount}` : totalCount}
          </span>
        </h2>
        {hasActiveFilters && (
          <button onClick={onResetFilters} className="text-button" title="Show everything">
            Reset
          </button>
        )}
        {isOpenMobile && (
          <button onClick={onCloseMobile} className="icon-button md:hidden" aria-label="Close filters">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSearch && (
      <div className="search">
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects, tech, commands"
          aria-label="Search projects"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[var(--fg-3)] hover:text-[var(--fg)]"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </div>
      )}

      {/* Status */}
      <div className="filter-group">
        <div className="section-head">
          <h3>Status</h3>
          <span className="hint">double-click for only</span>
        </div>
        <div>
          {STATUS_FILTER_ORDER.map((id) => {
            const shown = !hiddenStatuses.includes(id);
            const count = projects.filter((p) => p.status === id).length;
            return (
              <button
                key={id}
                aria-pressed={shown}
                onClick={() => statusToggle.onClick(id)}
                onDoubleClick={() => statusToggle.onDoubleClick(id)}
                className="model-row"
              >
                <StatusDot status={id} className={`w-[7px] h-[7px] ${shown ? '' : 'opacity-30'}`} />
                <span className="flex-1 truncate">{STATUS_META[id].label}</span>
                <span className="row-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority */}
      {showPriority && (
      <div className="filter-group">
        <div className="section-head">
          <h3>Priority</h3>
        </div>
        <div className="strike-filter">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              aria-pressed={!hiddenPriorities.includes(p)}
              onClick={() => priorityToggle.onClick(p)}
              onDoubleClick={() => priorityToggle.onDoubleClick(p)}
              title={`${p} · ${PRIORITY_META[p]}`}
            >
              {p}
              <span className="row-count ml-1">{projects.filter((x) => x.priority === p).length}</span>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Category */}
      <div className="filter-group">
        <div className="section-head">
          <h3>Category</h3>
        </div>
        <div className="strike-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              aria-pressed={!hiddenCategories.includes(cat)}
              onClick={() => categoryToggle.onClick(cat)}
              onDoubleClick={() => categoryToggle.onDoubleClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory, following the filters above */}
      {showDirectory && (
      <div className="filter-group directory">
        <div className="section-head">
          <h3>Directory</h3>
          <span className="row-count">{filteredProjects.length}</span>
        </div>
        {filteredProjects.length === 0 ? (
          <p className="side-note">
            Nothing matches.{' '}
            <button className="text-button" onClick={onResetFilters}>
              Reset filters
            </button>
          </p>
        ) : (
          <div>
            {filteredProjects.map((proj) => {
              const { done, total } = progressOf(proj);
              const isSelected = selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  aria-pressed={isSelected}
                  className="model-row directory-row"
                  title={`${proj.title}: ${proj.subtitle}`}
                >
                  <StatusDot status={proj.status} className="w-[7px] h-[7px]" />
                  <span className="flex-1 truncate">{proj.title}</span>
                  <span className="row-count">
                    {done}/{total}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Data actions (phones only; on larger screens they live in the header) */}
      <div className="md:hidden flex gap-5 pt-3 border-t border-[var(--line)]">
        <button onClick={onExportJson} className="text-button">
          Export JSON
        </button>
        <button onClick={onResetData} className="text-button !text-[var(--fg-3)]">
          Reset data
        </button>
      </div>
    </aside>
  );
};
