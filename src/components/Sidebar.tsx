import React from 'react';
import type { ProjectIdea, ProjectStatus, PriorityLevel } from '../types';
import { Search, X, RotateCcw } from 'lucide-react';

interface SidebarProps {
  projects: ProjectIdea[];
  filteredCount: number;
  totalCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedProjectId: string | null;
  onSelectProject: (project: ProjectIdea) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onResetFilters: () => void;
}

const STATUSES: { id: ProjectStatus; label: string; color: string }[] = [
  { id: 'in_progress', label: 'In Progress', color: '#10b981' },
  { id: 'spike', label: 'Spike & R&D', color: '#f59e0b' },
  { id: 'planned', label: 'Planned', color: '#3b82f6' },
  { id: 'polishing', label: 'Polishing', color: '#0ea5e9' },
  { id: 'shipped', label: 'Shipped', color: '#a855f7' },
  { id: 'backlog', label: 'Backlog', color: '#71717a' },
];

const PRIORITIES: PriorityLevel[] = ['P0', 'P1', 'P2', 'P3'];

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  filteredCount,
  totalCount,
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedCategory,
  setSelectedCategory,
  selectedProjectId,
  onSelectProject,
  isOpenMobile,
  onCloseMobile,
  onResetFilters,
}) => {
  const categories = Array.from(new Set(projects.map((p) => p.category)));
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    selectedCategory !== 'all';

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'in_progress':
        return '#10b981';
      case 'spike':
        return '#f59e0b';
      case 'planned':
        return '#3b82f6';
      case 'polishing':
        return '#0ea5e9';
      case 'shipped':
        return '#a855f7';
      case 'backlog':
      default:
        return '#71717a';
    }
  };

  return (
    <aside className={`sidebar ${isOpenMobile ? 'open' : ''}`}>
      {/* Top Heading */}
      <div className="side-heading">
        <h2>
          <span>Projects</span>
          <span className="count-badge">
            ({filteredCount}{filteredCount !== totalCount ? `/${totalCount}` : ''})
          </span>
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-[var(--fg-3)] hover:text-[var(--fg)] md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Inline Search */}
      <div className="search">
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[var(--fg-3)] hover:text-[var(--fg)] cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </div>

      {/* Status Filter (Slopalytics strike/toggle style) */}
      <div>
        <div className="filter-section-title">
          <span>Lifecycle Status</span>
          {selectedStatus !== 'all' && (
            <button
              onClick={() => setSelectedStatus('all')}
              className="text-[10px] text-[var(--accent)] normal-case cursor-pointer hover:underline"
            >
              all
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {STATUSES.map((st) => {
            const isSelected = selectedStatus === st.id;
            const count = projects.filter((p) => p.status === st.id).length;
            return (
              <button
                key={st.id}
                onClick={() =>
                  setSelectedStatus(selectedStatus === st.id ? 'all' : st.id)
                }
                className={`flex items-center justify-between py-1 px-1.5 rounded text-xs transition cursor-pointer ${
                  isSelected
                    ? 'text-[var(--fg)] bg-[var(--hover)] font-medium'
                    : 'text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[var(--hover)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: st.color }}
                  />
                  <span>{st.label}</span>
                </span>
                <span className="font-mono text-[11px] text-[var(--fg-3)]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <div className="filter-section-title">
          <span>Priority</span>
          {selectedPriority !== 'all' && (
            <button
              onClick={() => setSelectedPriority('all')}
              className="text-[10px] text-[var(--accent)] normal-case cursor-pointer hover:underline"
            >
              all
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {PRIORITIES.map((p) => {
            const isSelected = selectedPriority === p;
            const count = projects.filter((item) => item.priority === p).length;
            return (
              <button
                key={p}
                onClick={() =>
                  setSelectedPriority(selectedPriority === p ? 'all' : p)
                }
                className={`py-1 text-center font-mono text-xs rounded border transition cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent)] text-[var(--fg)] bg-[var(--hover)] font-bold'
                    : 'border-[var(--line)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:border-[var(--line-2)]'
                }`}
              >
                {p} <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category / Ecosystem Filter */}
      <div>
        <div className="filter-section-title">
          <span>Ecosystem Category</span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[10px] text-[var(--accent)] normal-case cursor-pointer hover:underline"
            >
              all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`filter-pill cursor-pointer ${
              selectedCategory === 'all' ? 'active' : ''
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? 'all' : cat)
              }
              className={`filter-pill cursor-pointer ${
                selectedCategory === cat ? 'active' : ''
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Switcher / Project Rows */}
      <div className="flex-1 min-h-0 flex flex-col pt-2 border-t border-[var(--line)]">
        <div className="filter-section-title mb-2">
          <span>Quick Directory</span>
          <span className="font-mono text-[10px] text-[var(--fg-3)]">
            {projects.length}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto pr-1">
          {projects.map((proj) => {
            const completed = proj.milestones.filter((m) => m.completed).length;
            const total = proj.milestones.length;
            const isSelected = selectedProjectId === proj.id;

            return (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className={`project-row cursor-pointer ${
                  isSelected ? 'active' : ''
                }`}
                title={`${proj.title}: ${proj.subtitle}`}
              >
                <span
                  className="project-dot"
                  style={{ backgroundColor: getStatusColor(proj.status) }}
                />
                <span className="truncate flex-1 font-medium">{proj.title}</span>
                <span className="font-mono text-[10px] text-[var(--fg-3)]">
                  {completed}/{total}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
