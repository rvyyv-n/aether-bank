import React from 'react';
import { Lightbulb, Compass, TrendingUp, Gauge } from 'lucide-react';

type Section = 'vault' | 'roadmap' | 'analytics' | 'usage';

interface MobileNavProps {
  activeSection: Section;
  setActiveSection: (sec: Section) => void;
}

const ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'vault', label: 'Vault', icon: Lightbulb },
  { id: 'roadmap', label: 'Roadmap', icon: Compass },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'usage', label: 'Usage', icon: Gauge },
];

export const MobileNav: React.FC<MobileNavProps> = ({ activeSection, setActiveSection }) => (
  <nav className="mobile-nav" aria-label="Sections">
    {ITEMS.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        className={activeSection === id ? 'active' : ''}
        onClick={() => setActiveSection(id)}
        aria-current={activeSection === id ? 'page' : undefined}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </button>
    ))}
  </nav>
);
