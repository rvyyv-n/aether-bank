import React from 'react';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  Table2, 
  Compass, 
  RotateCcw, 
  Download, 
  Sun,
  Moon,
  Layers,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import type { ProjectIdea, ProjectStatus } from '../types';
import { BankerLogo } from './BankerLogo';

interface HeaderProps {
  projects: ProjectIdea[];
  filteredCount: number;
  viewMode: 'board' | 'table' | 'roadmap';
  setViewMode: (mode: 'board' | 'table' | 'roadmap') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  sortBy: 'priority' | 'status' | 'title' | 'progress' | 'updated';
  setSortBy: (sort: 'priority' | 'status' | 'title' | 'progress' | 'updated') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenNewModal: () => void;
  onResetData: () => void;
  onExportJson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  filteredCount,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  sortBy,
  setSortBy,
  theme,
  setTheme,
  onOpenNewModal,
  onResetData,
  onExportJson,
}) => {
  const categories = Array.from(new Set(projects.map(p => p.category)));

  const countByStatus = (status: ProjectStatus) => 
    projects.filter(p => p.status === status).length;

  const toggleStatusFilter = (status: string) => {
    setSelectedStatus(selectedStatus === status ? 'all' : status);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-main)] bg-[var(--bg-surface)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5">
        {/* Top bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--text-primary)] text-[var(--bg-surface)] flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105">
              <BankerLogo size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)] m-0">Banker</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-main)]">
                  v1.2
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  ({filteredCount === projects.length ? `${projects.length} vault projects` : `${filteredCount} of ${projects.length}`})
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] m-0">Local-first project & idea vault</p>
            </div>
          </div>

          {/* Quick Metrics filter tabs */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => toggleStatusFilter('in_progress')}
              className={`px-2.5 py-1 rounded-md border font-mono transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedStatus === 'in_progress'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-[var(--border-main)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-[var(--text-primary)]">{countByStatus('in_progress')}</span> In Progress
            </button>

            <button
              onClick={() => toggleStatusFilter('spike')}
              className={`px-2.5 py-1 rounded-md border font-mono transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedStatus === 'spike'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-[var(--border-main)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              <span className="font-semibold text-[var(--text-primary)]">{countByStatus('spike')}</span> Spike
            </button>

            <button
              onClick={() => toggleStatusFilter('planned')}
              className={`px-2.5 py-1 rounded-md border font-mono transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedStatus === 'planned'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-[var(--border-main)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span className="font-semibold text-[var(--text-primary)]">{countByStatus('planned')}</span> Planned
            </button>

            <button
              onClick={() => toggleStatusFilter('shipped')}
              className={`px-2.5 py-1 rounded-md border font-mono transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedStatus === 'shipped'
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                  : 'border-[var(--border-main)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
              <span className="font-semibold text-[var(--text-primary)]">{countByStatus('shipped')}</span> Shipped
            </button>

            <button
              onClick={() => toggleStatusFilter('backlog')}
              className={`px-2.5 py-1 rounded-md border font-mono transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedStatus === 'backlog'
                  ? 'border-zinc-400 text-zinc-300 bg-zinc-500/10'
                  : 'border-[var(--border-main)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500"></span>
              <span className="font-semibold text-[var(--text-primary)]">{countByStatus('backlog')}</span> Backlog
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to OLED Dark'}
              className="p-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-[var(--text-muted)] text-[var(--text-primary)] transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={onExportJson}
              title="Export as JSON"
              className="px-3 py-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-[var(--text-muted)] text-[var(--text-primary)] text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset default ideas"
              className="p-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-[var(--text-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onOpenNewModal}
              className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-surface)] hover:opacity-90 text-xs font-medium transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Idea</span>
            </button>
          </div>
        </div>

        {/* Controls row */}
        <div className="mt-3 pt-2.5 border-t border-[var(--border-main)] flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[var(--bg-surface)] p-0.5 rounded-lg border border-[var(--border-main)] w-fit">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('roadmap')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'roadmap'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Roadmap</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter ideas... (/)"
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg pl-8 pr-3 py-1 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)] transition"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-primary)] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-primary)] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="in_progress">In Progress</option>
                <option value="spike">Spike</option>
                <option value="planned">Planned</option>
                <option value="shipped">Shipped</option>
                <option value="backlog">Backlog</option>
                <option value="polishing">Polishing</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-primary)] cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 (Urgent)</option>
              <option value="P1">P1 (High)</option>
              <option value="P2">P2 (Medium)</option>
              <option value="P3">P3 (Low)</option>
            </select>

            {/* Sort by */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-primary)] cursor-pointer"
              >
                <option value="priority">Sort: Priority</option>
                <option value="status">Sort: Status</option>
                <option value="title">Sort: Name (A-Z)</option>
                <option value="progress">Sort: Progress %</option>
                <option value="updated">Sort: Recently Updated</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
