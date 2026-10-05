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
  Layers
} from 'lucide-react';
import type { ProjectIdea, ProjectStatus } from '../types';
import { BankerLogo } from './BankerLogo';

interface HeaderProps {
  projects: ProjectIdea[];
  viewMode: 'board' | 'table' | 'roadmap';
  setViewMode: (mode: 'board' | 'table' | 'roadmap') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenNewModal: () => void;
  onResetData: () => void;
  onExportJson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  theme,
  setTheme,
  onOpenNewModal,
  onResetData,
  onExportJson,
}) => {
  const categories = Array.from(new Set(projects.map(p => p.category)));

  const countByStatus = (status: ProjectStatus) => 
    projects.filter(p => p.status === status).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-main)] bg-[var(--bg-surface)] backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--text-primary)] text-[var(--bg-surface)] flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105">
              <BankerLogo size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)] m-0">Banker</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--border-subtle)] text-[var(--text-secondary)] border border-[var(--border-main)]">
                  v1.2
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] m-0">Project & Idea Vault</p>
            </div>
          </div>

          {/* Quick Metrics (Clean dots, no rainbow glow) */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 md:pb-0">
            <div className="px-2.5 py-1 rounded-md bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-secondary)] flex items-center gap-2 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-[var(--text-primary)]">{countByStatus('in_progress')}</span> In Progress
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-secondary)] flex items-center gap-2 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              <span className="font-medium text-[var(--text-primary)]">{countByStatus('spike')}</span> Spike
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-secondary)] flex items-center gap-2 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span className="font-medium text-[var(--text-primary)]">{countByStatus('planned')}</span> Planned
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-secondary)] flex items-center gap-2 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400"></span>
              <span className="font-medium text-[var(--text-primary)]">{countByStatus('backlog')}</span> Backlog
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to OLED Dark'}
              className="p-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-page)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] transition"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={onExportJson}
              title="Export as JSON"
              className="px-2.5 py-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-page)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs font-medium transition flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset default ideas"
              className="p-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-page)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onOpenNewModal}
              className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-surface)] hover:opacity-90 text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Idea</span>
            </button>
          </div>
        </div>

        {/* Controls row */}
        <div className="mt-3 pt-2.5 border-t border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[var(--bg-page)] p-0.5 rounded-lg border border-[var(--border-main)] w-fit">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'board'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('roadmap')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'roadmap'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Roadmap</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter ideas... (/)"
                className="w-full bg-[var(--bg-page)] border border-[var(--border-main)] rounded-lg pl-8 pr-3 py-1 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)] transition"
              />
            </div>

            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[var(--bg-page)] border border-[var(--border-main)] rounded-lg px-2 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-primary)]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
