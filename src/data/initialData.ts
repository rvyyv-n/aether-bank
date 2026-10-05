import type { ProjectIdea } from '../types';

export const INITIAL_PROJECTS: ProjectIdea[] = [
  {
    id: 'hyperlight',
    title: 'Hyperlight',
    subtitle: 'Minimal System Optimizer & Shell',
    category: 'System',
    status: 'in_progress',
    priority: 'P0',
    techStack: ['Rust', 'Tauri v2', 'Win32 API', 'Mica DWM'],
    description: 'Lightweight desktop utility with native window blur, declarative reversible configuration, and a modular dry-run execution engine.',
    problemStatement: 'Existing system utilities are often heavy, script-laden, and make irreversible changes without structured safety diffs.',
    architectureNotes: 'Direct API interaction without shell spawning. Dry-run mode evaluates changes in memory before execution. Custom translucent surface styling.',
    path: 'repos/hyperlight',
    license: 'MIT',
    milestones: [
      { id: 'm1', text: 'Initialize repository and architecture spec', completed: true },
      { id: 'm2', text: 'Declarative configuration schema with rollback support', completed: true },
      { id: 'm3', text: 'Implement dry-run verification engine', completed: true },
      { id: 'm4', text: 'Native translucent shell with minimal chrome', completed: false },
      { id: 'm5', text: 'Curate initial profile presets and safety boundaries', completed: false },
      { id: 'm6', text: 'Interactive before/after diff inspector', completed: false }
    ],
    upstreamRefs: [
      { name: 'Tauri v2 Documentation', url: 'https://v2.tauri.app/' },
      { name: 'Windows DWM Guidelines', url: 'https://learn.microsoft.com/en-us/windows/win32/dwm/' }
    ],
    commands: [
      { label: 'Check status', cmd: 'git status -s' },
      { label: 'Run dev', cmd: 'cargo tauri dev' },
      { label: 'Run tests', cmd: 'cargo test' }
    ],
    notes: 'Prioritize reversible operations and clean error boundaries before expanding the preset catalog.',
    updatedAt: '2026-10-05T10:00:00Z'
  },
  {
    id: 'kite',
    title: 'Kite',
    subtitle: 'Low-Latency Peripheral Companion',
    category: 'Hardware',
    status: 'planned',
    priority: 'P1',
    techStack: ['WebHID', 'TypeScript', 'Rust', 'Tailwind'],
    description: 'Hardware configuration companion replacing vendor bloatware with a clean card interface and user-space communication.',
    problemStatement: 'Proprietary peripheral software consumes hundreds of megabytes of background memory and installs unwanted background services.',
    architectureNotes: 'Communicates entirely through standard user-space USB/Bluetooth HID protocols without kernel drivers or anti-cheat conflicts.',
    path: 'repos/kite',
    license: 'MIT',
    milestones: [
      { id: 'p1', text: 'Verify WebHID API availability in native shell', completed: false },
      { id: 'p2', text: 'Extract and modularize protocol definitions', completed: false },
      { id: 'p3', text: 'DPI, polling rate, and battery telemetry support', completed: false },
      { id: 'p4', text: 'Card carousel interface with active device focus', completed: false }
    ],
    upstreamRefs: [
      { name: 'W3C WebHID API', url: 'https://wicg.github.io/webhid/' },
      { name: 'libratbag Reference', url: 'https://github.com/libratbag/libratbag' }
    ],
    commands: [
      { label: 'Run dev', cmd: 'npm run dev' }
    ],
    notes: 'Focus on clean device disconnect/reconnect handling and persistent device profiles.',
    updatedAt: '2026-10-04T20:00:00Z'
  },
  {
    id: 'prism',
    title: 'Prism',
    subtitle: 'Minimal Multi-Engine Web Browser',
    category: 'Browser',
    status: 'spike',
    priority: 'P2',
    techStack: ['wry', 'WebView2', 'adblock-rust', 'CEF'],
    description: 'Ultra-fast web browser focusing on vertical tab ergonomics, container workspaces, and built-in network filtering.',
    problemStatement: 'Modern browsers have become heavy application platforms loaded with unwanted features, sidebars, and telemetry.',
    architectureNotes: 'Lightweight shell orchestrating isolated webview contexts. Native network interception powered by compiled adblock rules.',
    path: 'repos/prism',
    license: 'MIT',
    milestones: [
      { id: 'b1', text: 'Multi-webview window spike using wry', completed: false },
      { id: 'b2', text: 'Vertical tabs and collapsible navigation rail', completed: false },
      { id: 'b3', text: 'Request filter integration with adblock rules', completed: false },
      { id: 'b4', text: 'Isolated container sessions per workspace', completed: false }
    ],
    upstreamRefs: [
      { name: 'wry Window Rendering Engine', url: 'https://github.com/tauri-apps/wry' },
      { name: 'Brave adblock-rust', url: 'https://github.com/brave/adblock-rust' }
    ],
    commands: [
      { label: 'Run spike', cmd: 'cargo run' }
    ],
    notes: 'Evaluate webview resource footprint when multiple tab processes are open simultaneously.',
    updatedAt: '2026-10-04T18:00:00Z'
  },
  {
    id: 'vesper',
    title: 'Vesper UI',
    subtitle: 'Design System & Component Primitives',
    category: 'Design',
    status: 'in_progress',
    priority: 'P1',
    techStack: ['Tailwind v4', 'CSS Tokens', 'Lucide', 'TypeScript'],
    description: 'Shared design tokens, custom window chrome, dark translucent card primitives, and OLED styling across applications.',
    problemStatement: 'Building separate tools without a shared design foundation leads to visual inconsistency and duplicated UI code.',
    architectureNotes: 'Custom CSS variables for OLED dark and clean light modes with tight spatial rhythm and restrained typography.',
    path: 'repos/vesper',
    license: 'MIT',
    milestones: [
      { id: 'u1', text: 'Define color palette, typography, and spacing tokens', completed: true },
      { id: 'u2', text: 'OLED dark and crisp light mode variables', completed: true },
      { id: 'u3', text: 'Custom window frame and header navigation components', completed: true },
      { id: 'u4', text: 'Package into reusable internal library', completed: false }
    ],
    upstreamRefs: [
      { name: 'Radix UI Primitives', url: 'https://www.radix-ui.com/' }
    ],
    commands: [
      { label: 'Build tokens', cmd: 'npm run build' }
    ],
    notes: 'Keep component APIs minimal with zero unnecessary props or runtime styling overhead.',
    updatedAt: '2026-10-04T16:00:00Z'
  },
  {
    id: 'relay',
    title: 'Relay Hub',
    subtitle: 'Static Distribution & Documentation',
    category: 'Web',
    status: 'backlog',
    priority: 'P3',
    techStack: ['Astro', 'TypeScript', 'GitHub Pages'],
    description: 'Fast, clean landing page showcasing project downloads, documentation, and live release assets.',
    problemStatement: 'Open-source projects require clear documentation and direct download entry points without complex hosting infrastructure.',
    architectureNotes: 'Static site generation with zero runtime JavaScript required for reading. Direct download links resolved via GitHub API.',
    path: 'repos/relay',
    license: 'MIT',
    milestones: [
      { id: 's1', text: 'Hero layout and interactive product cards', completed: false },
      { id: 's2', text: 'Individual documentation and feature pages', completed: false },
      { id: 's3', text: 'Automated release download button integration', completed: false }
    ],
    upstreamRefs: [
      { name: 'Astro Web Framework', url: 'https://astro.build/' }
    ],
    commands: [
      { label: 'Run dev', cmd: 'npm run dev' }
    ],
    notes: 'Ensure instant page loads and zero external font or script dependencies.',
    updatedAt: '2026-10-04T14:00:00Z'
  },
  {
    id: 'orbit',
    title: 'Orbit CI',
    subtitle: 'Automated Multi-Arch Build Pipeline',
    category: 'DevOps',
    status: 'planned',
    priority: 'P2',
    techStack: ['GitHub Actions', 'SignPath', 'winget'],
    description: 'Automated workflow producing multi-architecture binaries, open-source code signing, and package manager releases.',
    problemStatement: 'Manual releases are error-prone and unsigned binaries trigger security warnings that degrade user trust.',
    architectureNotes: 'GitHub Actions matrix build paired with automated manifest updates for package managers.',
    path: 'repos/orbit',
    license: 'MIT',
    milestones: [
      { id: 'd1', text: 'Configure matrix build for x64 and ARM64 artifacts', completed: false },
      { id: 'd2', text: 'Integrate open-source code signing step', completed: false },
      { id: 'd3', text: 'Automated package manager manifest publication', completed: false }
    ],
    upstreamRefs: [
      { name: 'SignPath Foundation', url: 'https://signpath.org/' },
      { name: 'Windows Package Manager', url: 'https://github.com/microsoft/winget-pkgs' }
    ],
    commands: [
      { label: 'Check workflows', cmd: 'gh workflow list' }
    ],
    notes: 'Focus on reproducible builds and verifiable release checksums.',
    updatedAt: '2026-10-04T12:00:00Z'
  }
];
