export type ProjectStatus = 'planned' | 'spike' | 'in_progress' | 'polishing' | 'shipped';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface MilestoneItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectIdea {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  techStack: string[];
  description: string;
  problemStatement?: string;
  architectureNotes?: string;
  milestones: MilestoneItem[];
  path?: string;
  threadId?: string;
  upstreamRefs?: { name: string; url: string }[];
  license?: string;
  notes?: string;
  commands?: { label: string; cmd: string }[];
  updatedAt: string;
}

export type SortKey = 'priority' | 'status' | 'title' | 'progress' | 'updated';

export interface SortProps {
  sortBy: SortKey;
  sortReversed: boolean;
  onSort: (key: SortKey) => void;
}
