import React from 'react';
import { 
  Plus, 
  Download, 
  RotateCcw, 
  Sun, 
  Moon, 
  SlidersHorizontal,
  LayoutGrid,
  Table2,
  ArrowUpDown,
  Search
} from 'lucide-react';
import type { ProjectIdea } from '../types';
import { BankerLogo } from './BankerLogo';

interface HeaderProps {
  projects: ProjectIdea[];
  filteredCount: number;
  activeSection: 'vault' | 'roadmap' | 'analytics' | 'usage';
  setActiveSection: (sec: 'vault' | 'roadmap' | 'analytics' | 'usage') => void;
  viewMode: 'overview' | 'table';
  setViewMode: (mode: 'overview' | 'table') => void;
  sortBy: 'priority' | 'status' | 'title' | 'progress' | 'updated';
  setSortBy: (sort: 'priority' | 'status' | 'title' | 'progress' | 'updated') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenNewModal: () => void;
  onResetData: () => void;
  onExportJson: () => void;
  onToggleMobileSidebar: () => void;
  onOpenPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  filteredCount,
  activeSection,
  setActiveSection,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  theme,
  setTheme,
  onOpenNewModal,
  onResetData,
  onExportJson,
  onToggleMobileSidebar,
  onOpenPalette,
}) => {
  return (
    <header className="app-header">
      {/* Brand */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveSection('vault');
        }}
        className="brand"
        aria-label="Banker home"
      >
        <BankerLogo size={20} className="flex-shrink-0 text-[var(--accent)]" />
        <strong>
          <span>Bank</span>er
        </strong>
      </a>

      {/* Main Section Navigation Tabs (Slopalytics style) */}
      <nav className="section-tabs" aria-label="Sections">
        <button
          className={activeSection === 'vault' ? 'active' : ''}
          onClick={() => setActiveSection('vault')}
        >
          Vault
        </button>
        <button
          className={activeSection === 'roadmap' ? 'active' : ''}
          onClick={() => setActiveSection('roadmap')}
        >
          Roadmap
        </button>
        <button
          className={activeSection === 'analytics' ? 'active' : ''}
          onClick={() => setActiveSection('analytics')}
        >
          Analytics
        </button>
        <button
          className={activeSection === 'usage' ? 'active' : ''}
          onClick={() => setActiveSection('usage')}
        >
          Usage
        </button>
      </nav>

      {/* Overview / table switch; the other sections carry their own controls */}
      <nav className="view-tabs" aria-label="Sub views">
        {activeSection === 'vault' && (
          <>
            <button
              className={viewMode === 'overview' ? 'active' : ''}
              onClick={() => setViewMode('overview')}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              Overview
            </button>
            <button
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              <Table2 className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              Table
            </button>
            <span className="tab-divider" aria-hidden="true" />
            <span className="text-[12px] tabular-nums text-[var(--fg-3)] hidden sm:inline">
              {filteredCount === projects.length ? `${projects.length} ideas` : `${filteredCount}/${projects.length}`}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[var(--fg-3)]">
              <ArrowUpDown className="h-3 w-3" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as HeaderProps['sortBy'])}
                className="bg-transparent border-0 text-[11.5px] text-[var(--fg-2)] hover:text-[var(--fg)] cursor-pointer focus:outline-none"
              >
                <option value="priority" className="bg-[var(--surface)] text-[var(--fg)]">Sort: Priority</option>
                <option value="status" className="bg-[var(--surface)] text-[var(--fg)]">Sort: Status</option>
                <option value="title" className="bg-[var(--surface)] text-[var(--fg)]">Sort: Title</option>
                <option value="progress" className="bg-[var(--surface)] text-[var(--fg)]">Sort: Progress</option>
                <option value="updated" className="bg-[var(--surface)] text-[var(--fg)]">Sort: Updated</option>
              </select>
            </div>
          </>
        )}

      </nav>

      {/* Header Actions */}
      <div className="header-actions">
        <button
          className="quick-switch"
          onClick={onOpenPalette}
          aria-label="Quick switcher"
          title="Quick switcher (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="max-lg:hidden">Jump to</span>
          <kbd className="max-lg:hidden">Ctrl K</kbd>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          className="icon-button cursor-pointer"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Export JSON */}
        <button
          className="icon-button cursor-pointer hide-phone"
          onClick={onExportJson}
          aria-label="Export vault JSON"
          title="Export vault JSON"
        >
          <Download className="h-4 w-4" />
        </button>

        {/* Reset Data */}
        <button
          className="icon-button cursor-pointer hide-phone"
          onClick={onResetData}
          aria-label="Reset default vault data"
          title="Reset default vault data"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* New Project CTA */}
        <button
          onClick={onOpenNewModal}
          className="btn-accent cursor-pointer ml-1 max-md:h-9 max-md:w-9 max-md:justify-center max-md:!p-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="max-md:hidden">New idea</span>
        </button>

        {/* Mobile Filter Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="icon-button md:hidden cursor-pointer"
          aria-label="Toggle filters"
          title="Toggle filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
