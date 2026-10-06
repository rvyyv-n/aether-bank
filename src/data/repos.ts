import { useEffect, useMemo, useState } from 'react';
import type { ProjectIdea } from '../types';

/** Git state of a project's folder, read locally by the server (see scripts/repo-status.cjs). */
export interface RepoInfo {
  found: boolean;
  branch?: string;
  commit?: string;
  commitAt?: string;
  subject?: string;
  dirty?: number;
  ahead?: number;
  behind?: number;
}

export interface Activity {
  repo?: RepoInfo;
  /** Most recent of the last commit and the last day a coding session used this folder */
  lastActive?: string;
  daysIdle?: number;
}

export type ActivityMap = Record<string, Activity>;

const DAY = 86_400_000;

export function useActivity(projects: ProjectIdea[]): ActivityMap {
  const [data, setData] = useState<{ repos: Record<string, RepoInfo>; seen: Record<string, string>; at: number } | null>(null);
  // Refetch only when the set of paths changes, not on every edit
  const key = projects.map((p) => p.path ?? '').filter(Boolean).sort().join('\n');

  useEffect(() => {
    if (!key) return;
    const query = key.split('\n').map((p) => `p=${encodeURIComponent(p)}`).join('&');
    let live = true;
    fetch(`./repos.json?${query}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => live && j && setData({ ...j, at: Date.now() }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key]);

  return useMemo(() => {
    const out: ActivityMap = {};
    if (!data) return out;
    for (const p of projects) {
      if (!p.path) continue;
      const repo = data.repos[p.path];
      const label = (p.path.split(/[/\\]/).pop() ?? '').toLowerCase();
      const times = [repo?.commitAt, data.seen[label]].filter(Boolean).map((t) => Date.parse(t as string));
      const latest = times.length ? Math.max(...times) : undefined;
      out[p.id] = {
        repo,
        lastActive: latest ? new Date(latest).toISOString() : undefined,
        daysIdle: latest ? Math.max(0, Math.floor((data.at - latest) / DAY)) : undefined,
      };
    }
    return out;
  }, [data, projects]);
}

export const idleLabel = (days?: number) =>
  days === undefined ? '' : days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days}d ago`;
