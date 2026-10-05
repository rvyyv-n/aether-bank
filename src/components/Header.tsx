import React from 'react';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  Table2, 
  Compass, 
  RotateCcw, 
  Download, 
  Sparkles,
  Layers
} from 'lucide-react';
import type { ProjectIdea, ProjectStatus } from '../types';

interface HeaderProps {
  projects: ProjectIdea[];
  viewMode: 'board' | 'table' | 'roadmap';
  setViewMode: (mode: 'board' | 'table' | 'roadmap') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
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
  onOpenNewModal,
  onResetData,
  onExportJson,
}) => {
  const categories = Array.from(new Set(projects.map(p => p.category)));

  const countByStatus = (status: ProjectStatus) => 
    projects.filter(p => p.status === status).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] mica-surface">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white m-0">Aether Bank</h1>
                <span className="px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  v1.0 · T3 CRM
                </span>
              </div>
              <p className="text-xs text-zinc-400 m-0">Autonomous Project & Idea Bank · Fluent / Mica Ecosystem</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1 md:pb-0">
            <div className="px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-white">{countByStatus('in_progress')}</span> In Progress
            </div>
            <div className="px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-white">{countByStatus('spike')}</span> R&D / Spike
            </div>
            <div className="px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              <span className="font-semibold text-white">{countByStatus('planned')}</span> Planned
            </div>
            <div className="px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
              <span className="font-semibold text-white">{countByStatus('backlog')}</span> Backlog
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportJson}
              title="Export as JSON"
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={onResetData}
              title="Reset to default context"
              className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-zinc-200 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onOpenNewModal}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium transition shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Idea / Project</span>
            </button>
          </div>
        </div>

        {/* Bottom controls row */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-950/80 p-0.5 rounded-lg border border-white/10 w-fit">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'board'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>CRM Table</span>
            </button>
            <button
              onClick={() => setViewMode('roadmap')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'roadmap'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Roadmap</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas, tech, status... (/)"
                className="w-full bg-zinc-950/70 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition"
              />
            </div>

            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-950/70 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/60"
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
