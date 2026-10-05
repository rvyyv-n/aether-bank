import { useState, useEffect } from 'react';
import type { ProjectIdea, ProjectStatus } from './types';
import { INITIAL_PROJECTS } from './data/initialData';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { RoadmapView } from './components/RoadmapView';
import { ProjectDrawer } from './components/ProjectDrawer';
import { NewProjectModal } from './components/NewProjectModal';

const STORAGE_KEY = 'aether_project_bank_v1';

export function App() {
  const [projects, setProjects] = useState<ProjectIdea[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored projects', e);
    }
    return INITIAL_PROJECTS;
  });

  const [viewMode, setViewMode] = useState<'board' | 'table' | 'roadmap'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [projects]);

  // Global hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if active in input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        setSelectedProject(null);
        setIsNewModalOpen(false);
      } else if (e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsNewModalOpen(true);
      } else if (e.key === '1') {
        setViewMode('board');
      } else if (e.key === '2') {
        setViewMode('table');
      } else if (e.key === '3') {
        setViewMode('roadmap');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === 'all' || project.category === selectedCategory;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesQuery =
      project.title.toLowerCase().includes(q) ||
      project.subtitle.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q) ||
      project.techStack.some((t) => t.toLowerCase().includes(q)) ||
      (project.notes && project.notes.toLowerCase().includes(q)) ||
      project.status.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });

  const handleUpdateStatus = (projectId: string, newStatus: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, status: newStatus, updatedAt: new Date().toISOString() }
          : p
      )
    );
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleUpdateProject = (updated: ProjectIdea) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProject(updated);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  const handleAddProject = (newProject: ProjectIdea) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProject(newProject);
  };

  const handleResetData = () => {
    if (confirm('Reset idea bank back to default initial context? Any custom edits will be reverted.')) {
      setProjects(INITIAL_PROJECTS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aether-project-bank-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[300px] left-1/4 w-[700px] h-[500px] bg-gradient-to-br from-indigo-900/25 to-cyan-900/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -right-[200px] w-[600px] h-[600px] bg-gradient-to-tl from-purple-900/20 to-transparent rounded-full blur-[150px]" />
        <div className="absolute inset-0 grain-overlay opacity-30" />
      </div>

      {/* Main Header */}
      <Header
        projects={projects}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onResetData={handleResetData}
        onExportJson={handleExportJson}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10">
        {viewMode === 'board' && (
          <KanbanBoard
            projects={filteredProjects}
            onSelectProject={setSelectedProject}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {viewMode === 'table' && (
          <TableView
            projects={filteredProjects}
            onSelectProject={setSelectedProject}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {viewMode === 'roadmap' && (
          <RoadmapView
            projects={projects}
            onSelectProject={setSelectedProject}
          />
        )}
      </main>

      {/* Footer Hotkeys Bar */}
      <footer className="w-full border-t border-white/[0.06] bg-zinc-950/80 py-2.5 px-4 text-center z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-mono gap-2">
          <div className="flex items-center gap-3">
            <span>Shortcuts:</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">N</kbd> New Idea</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">/</kbd> Search</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">1</kbd><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 ml-1">2</kbd><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 ml-1">3</kbd> Switch Views</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">ESC</kbd> Close</span>
          </div>
          <div>
            <span>Local CRM Host: http://localhost:3333 · Storage: Persistent</span>
          </div>
        </div>
      </footer>

      {/* Project Detail Drawer */}
      <ProjectDrawer
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}

export default App;
