import { useState, useEffect } from 'react';
import type { ProjectIdea, ProjectStatus, PriorityLevel } from './types';
import { INITIAL_PROJECTS } from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { RoadmapView } from './components/RoadmapView';
import { AnalyticsView } from './components/AnalyticsView';
import { MobileNav } from './components/MobileNav';
import { UsageView } from './components/UsageView';
import { ProjectDrawer } from './components/ProjectDrawer';
import { NewProjectModal } from './components/NewProjectModal';

const STORAGE_KEY = 'banker_vault_v3';
const THEME_KEY = 'banker_theme_v1';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {
      console.error(e);
    }
    return 'dark'; // Slopalytics dark default
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

  const [activeSection, setActiveSection] = useState<'vault' | 'roadmap' | 'analytics' | 'usage'>('vault');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState<'priority' | 'status' | 'title' | 'progress' | 'updated'>('priority');

  const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync theme to document element
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', theme === 'light' ? '#ffffff' : '#000000');
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
        setIsMobileSidebarOpen(false);
      } else if (e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        const searchInput = document.querySelector('.search input') as HTMLInputElement;
        searchInput?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsNewModalOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      } else if (e.key === '1') {
        setActiveSection('vault');
        setViewMode('board');
      } else if (e.key === '2') {
        setActiveSection('vault');
        setViewMode('table');
      } else if (e.key === '3') {
        setActiveSection('roadmap');
      } else if (e.key === '4') {
        setActiveSection('analytics');
      } else if (e.key === '5') {
        setActiveSection('usage');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesCategory =
        selectedCategory === 'all' || project.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all' || project.status === selectedStatus;

      const matchesPriority =
        selectedPriority === 'all' || project.priority === selectedPriority;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.subtitle.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.techStack.some((t) => t.toLowerCase().includes(q)) ||
        (project.notes && project.notes.toLowerCase().includes(q)) ||
        project.status.toLowerCase().includes(q) ||
        (project.path && project.path.toLowerCase().includes(q)) ||
        (project.commands &&
          project.commands.some(
            (c) =>
              c.cmd.toLowerCase().includes(q) ||
              c.label.toLowerCase().includes(q)
          ));

      return matchesCategory && matchesStatus && matchesPriority && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const pOrder: Record<PriorityLevel, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
        return pOrder[a.priority] - pOrder[b.priority];
      }
      if (sortBy === 'status') {
        const sOrder: Record<ProjectStatus, number> = {
          in_progress: 0,
          spike: 1,
          polishing: 2,
          planned: 3,
          backlog: 4,
          shipped: 5,
        };
        return sOrder[a.status] - sOrder[b.status];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'progress') {
        const pA =
          a.milestones.length > 0
            ? a.milestones.filter((m) => m.completed).length / a.milestones.length
            : 0;
        const pB =
          b.milestones.length > 0
            ? b.milestones.filter((m) => m.completed).length / b.milestones.length
            : 0;
        return pB - pA;
      }
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
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
      setSelectedCategory('all');
      setSelectedStatus('all');
      setSelectedPriority('all');
      setSearchQuery('');
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSearchQuery('');
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `banker-vault-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="app">
      {/* Header matching Slopalytics structure */}
      <Header
        projects={projects}
        filteredCount={filteredProjects.length}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        theme={theme}
        setTheme={setTheme}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onResetData={handleResetData}
        onExportJson={handleExportJson}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Body Layout: Fluid Content + Slopalytics Right Sidebar */}
      <div className="body-layout">
        <main key={activeSection + viewMode} className="main-content view-enter p-4 sm:p-6">
          {activeSection === 'vault' && viewMode === 'board' && (
            <KanbanBoard
              projects={filteredProjects}
              onSelectProject={setSelectedProject}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeSection === 'vault' && viewMode === 'table' && (
            <TableView
              projects={filteredProjects}
              onSelectProject={setSelectedProject}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeSection === 'roadmap' && (
            <RoadmapView
              projects={filteredProjects}
              onSelectProject={setSelectedProject}
            />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsView
              projects={filteredProjects}
              onSelectProject={setSelectedProject}
            />
          )}

          {activeSection === 'usage' && <UsageView />}
        </main>

        {/* Slopalytics Right-Hand Sidebar */}
        <Sidebar
          projects={projects}
          filteredCount={filteredProjects.length}
          totalCount={projects.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedProjectId={selectedProject?.id || null}
          onSelectProject={setSelectedProject}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onResetFilters={handleResetFilters}
          onExportJson={handleExportJson}
          onResetData={handleResetData}
        />
      </div>

      <MobileNav activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Slide-over Project Drawer */}
      <ProjectDrawer
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* New Project Idea Modal */}
      <NewProjectModal
        isOpen={isNewModalOpen}
        existingIds={projects.map((p) => p.id)}
        categories={Array.from(new Set(projects.map((p) => p.category)))}
        onClose={() => setIsNewModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}

export default App;
