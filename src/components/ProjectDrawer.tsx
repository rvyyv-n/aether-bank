import React from 'react';
import type { ProjectIdea } from '../types';
import { X, Trash2, Maximize2 } from 'lucide-react';
import { StatusDot } from './ui';
import { ProjectBody } from './ProjectBody';

interface ProjectDrawerProps {
  project: ProjectIdea | null;
  categories: string[];
  onClose: () => void;
  onOpenPage: (project: ProjectIdea) => void;
  onUpdateProject: (updated: ProjectIdea) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
  project,
  categories,
  onClose,
  onOpenPage,
  onUpdateProject,
  onDeleteProject,
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden backdrop flex justify-end" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="drawer-panel w-full max-w-xl bg-[var(--bg)] border-l border-[var(--line)] h-full overflow-y-auto flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[var(--bg)] px-5 sm:px-7 h-14 border-b border-[var(--line)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 text-[11.5px] text-[var(--fg-3)]">
            <StatusDot status={project.status} className="w-[7px] h-[7px]" />
            <span className="font-mono truncate">{project.id}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenPage(project)}
              className="icon-button"
              title="Open as a page"
              aria-label="Open as a page"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${project.title}" from Banker?`)) {
                  onDeleteProject(project.id);
                  onClose();
                }
              }}
              className="icon-button hover:!text-rose-500"
              title="Delete project"
              aria-label="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="icon-button" title="Close (Esc)" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-7 pt-6 pb-10 flex-1">
          <ProjectBody
            key={project.id}
            project={project}
            categories={categories}
            onUpdateProject={onUpdateProject}
          />
        </div>
      </div>
    </div>
  );
};
