import { useState, useEffect } from 'react';
import type { ProjectIdea, ProjectStatus } from './types';
import { INITIAL_PROJECTS } from './data/initialData';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { RoadmapView } from './components/RoadmapView';
import { ProjectDrawer } from './components/ProjectDrawer';
import { NewProjectModal } from './components/NewProjectModal';

const STORAGE_KEY = 'banker_vault_v2';
const THEME_KEY = 'banker_theme_v1';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {
      console.error(e);
    }
    return 'dark'; // OLED dark default
  });

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

  // Sync theme class to document
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Sync projects to localStorage
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
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
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
    if (confirm('Reset idea bank back to default initial context?')) {
      setProjects(INITIAL_PROJECTS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `banker-vault-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <Header
        projects={projects}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        theme={theme}
        setTheme={setTheme}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onResetData={handleResetData}
        onExportJson={handleExportJson}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
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

      {/* Minimal Footer */}
      <footer className="w-full border-t border-[var(--border-main)] bg-[var(--bg-surface)] py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono gap-2">
          <div className="flex items-center gap-2">
            <span>Shortcuts:</span>
            <span><kbd className="px-1 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-primary)]">N</kbd> New</span>
            <span><kbd className="px-1 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-primary)]">T</kbd> Theme</span>
            <span><kbd className="px-1 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-primary)]">/</kbd> Search</span>
            <span><kbd className="px-1 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-primary)]">1</kbd><kbd className="px-1 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-primary)] ml-0.5">2</kbd><kbd className="px-1 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-main)] text-[var(--text-primary)] ml-0.5">3</kbd> Views</span>
          </div>
          <div>
            <span>Banker · Local & Offline Capable</span>
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
