import type { ProjectIdea } from '../types';

export const INITIAL_PROJECTS: ProjectIdea[] = [
  {
    id: 'aether',
    title: 'Aether',
    subtitle: 'Minimal, Reversible Windows 11 Debloater & Optimizer',
    category: 'System Utility',
    status: 'in_progress',
    priority: 'P0',
    techStack: ['Rust', 'Tauri v2', 'WebView2', 'Windows DWM', 'Win32 API'],
    description: 'High-performance, beautifully styled Windows debloating tool with native Mica blur, zero PowerShell dependencies, declarative reversible tweaks, and an Advanced mode.',
    problemStatement: 'Existing debloaters (Winutil, Win11Debloat) are heavy, script-laden, fragile, and often leave behind un-trackable changes without clear rollbacks or safety diffs.',
    architectureNotes: 'Rust core handles direct registry, service, Appx package, and scheduled task manipulation. Dry-run mode tests against mocked registry states to prevent unintended system modifications. Tauri v2 shell provides a native Windows 11 Mica backdrop.',
    path: 'D:\\Code\\Repos\\aether',
    threadId: 'mcp:1f049654-d9d9-4a57-a44b-68b22e9ca5a9:fork',
    license: 'MIT',
    milestones: [
      { id: 'm1', text: 'Initialize repository & register in T3 Code', completed: true },
      { id: 'm2', text: 'Fork dedicated autonomous build thread in T3 Code', completed: true },
      { id: 'm3', text: 'Establish declarative tweak schema (JSON/TOML with apply/undo steps)', completed: false },
      { id: 'm4', text: 'Implement Rust dry-run engine and mocked registry layer', completed: false },
      { id: 'm5', text: 'Scaffold Tauri v2 shell with Fluent Mica backdrop & film grain', completed: false },
      { id: 'm6', text: 'Curate 15-25 safe v1 tweaks across Telemetry, Services, and Bloatware', completed: false },
      { id: 'm7', text: 'Build interactive before/after diff viewer & system restore trigger', completed: false },
      { id: 'm8', text: 'Build Advanced Section: custom TOML tweak loader & Group Policy editor', completed: false },
      { id: 'm9', text: 'Windows Update drift detection and automatic re-audit', completed: false }
    ],
    upstreamRefs: [
      { name: 'Winutil by Chris Titus', url: 'https://github.com/ChrisTitusTech/winutil' },
      { name: 'Win11Debloat', url: 'https://github.com/Raphire/Win11Debloat' },
      { name: 'O&O ShutUp10++', url: 'https://www.oo-software.com/en/shutup10' },
      { name: 'Sophia Script for Windows', url: 'https://github.com/farag2/Sophia-Script-for-Windows' }
    ],
    commands: [
      { label: 'Navigate to Repo', cmd: 'cd D:\\Code\\Repos\\aether' },
      { label: 'Check Git Status', cmd: 'git -C "D:\\Code\\Repos\\aether" status' },
      { label: 'Run Tauri Dev', cmd: 'cargo tauri dev' }
    ],
    notes: 'Currently undergoing initial planning & autonomous build preparation in T3 Code forked thread. Ensure safe dry-run mocking is enforced before executing live registry tweaks.',
    updatedAt: '2026-10-05T09:40:00Z'
  },
  {
    id: 'peripheral-tool',
    title: 'OpenMouse Companion',
    subtitle: 'Native Windows Peripheral & Mouse Configurator',
    category: 'Hardware & Input',
    status: 'planned',
    priority: 'P1',
    techStack: ['Tauri v2', 'WebHID', 'TypeScript', 'Rust hidapi', 'Lucide'],
    description: 'Minimalist desktop utility replacing bloated manufacturer suites (Logitech G Hub, Razer Synapse) with a sleek Fluent/Mica card carousel and zero background bloat.',
    problemStatement: 'Proprietary mouse drivers consume hundreds of megabytes of RAM, inject background telemetry services, and offer clunky, slow UIs.',
    architectureNotes: 'Runs purely in user space over WebHID API or Rust `hidapi`. Eliminates kernel-level drivers to prevent anti-cheat triggers and driver signing hassles. Employs Logitech HID++ 2.0 protocol for onboard memory profiles, DPI, and battery queries.',
    license: 'AGPL-3.0 (derived from OpenMouse protocol base)',
    milestones: [
      { id: 'p1', text: 'Verify WebHID API availability and permissions inside Tauri v2 WebView2', completed: false },
      { id: 'p2', text: 'Extract and modularize OpenMouse TypeScript protocol and device registry', completed: false },
      { id: 'p3', text: 'Implement Logitech Lightspeed receiver & mouse telemetry (DPI, polling, battery)', completed: false },
      { id: 'p4', text: 'Build OpenMouse-inspired horizontal carousel UI with card-peeking', completed: false },
      { id: 'p5', text: 'Integrate Wooting Analog SDK for keyboard configuration', completed: false }
    ],
    upstreamRefs: [
      { name: 'OpenMouse GitHub Repo', url: 'https://github.com/OpenMouse-Project/openmouse' },
      { name: 'Solaar (Logitech HID++ reference)', url: 'https://github.com/pwr-Solaar/Solaar' },
      { name: 'libratbag', url: 'https://github.com/libratbag/libratbag' },
      { name: 'Wooting Analog SDK', url: 'https://github.com/WootingKb/wooting-analog-sdk' }
    ],
    commands: [
      { label: 'Inspect OpenMouse Repo', cmd: 'git clone https://github.com/OpenMouse-Project/openmouse.git' }
    ],
    notes: 'UI follows OpenMouse announcement mockup: dark translucent card carousel, prominent product render, green status dot, VID:PID capability tags, and film grain scrim.',
    updatedAt: '2026-10-04T20:26:00Z'
  },
  {
    id: 'minimal-browser',
    title: 'Aether Browser',
    subtitle: 'Pure Performance, Zero-Bloat Windows 11 Web Browser',
    category: 'Web Browser',
    status: 'spike',
    priority: 'P2',
    techStack: ['Tauri v2', 'wry / WebView2', 'adblock-rust', 'CEF (Evaluated)'],
    description: 'Ultra-fast, minimalist web browser with Zen Browser ergonomics (vertical tabs, workspaces, glance previews) backed by native Windows 11 Mica aesthetics and built-in adblocking.',
    problemStatement: 'Mainstream browsers are bloated with AI sidebars, shopping integrations, and tracking telemetry. Building Chromium from source costs 100GB+ and hours per build, making solo maintenance prohibitive.',
    architectureNotes: 'Recommended architecture: Tauri v2 shell orchestrating multiple WebView2 instances (one per tab or workspace), or prebuilt CEF binaries. Custom request interception integrates Brave\'s `adblock-rust` for sub-millisecond network filtering. Per-workspace isolated user-data folders give container tabs for $0 compute cost.',
    license: 'GPL-3.0 or MIT',
    milestones: [
      { id: 'b1', text: 'Weekend spike: Multi-webview window prototype using Tauri v2 & wry', completed: false },
      { id: 'b2', text: 'Implement Zen-style collapsible sidebar with vertical tabs and glance preview', completed: false },
      { id: 'b3', text: 'Embed Brave adblock-rust engine in Rust core for native request interception', completed: false },
      { id: 'b4', text: 'Wire isolated user data directories per workspace (cookie/session containers)', completed: false },
      { id: 'b5', text: 'Test Widevine DRM & video codec support against streaming services', completed: false }
    ],
    upstreamRefs: [
      { name: 'Zen Browser', url: 'https://zen-browser.app/' },
      { name: 'Limni Browser (Tauri v2 multi-tab)', url: 'https://gitverse.ru/FerrisMind/Limni' },
      { name: 'Brave adblock-rust', url: 'https://github.com/brave/adblock-rust' },
      { name: 'wry Window Rendering Engine', url: 'https://github.com/tauri-apps/wry' }
    ],
    commands: [
      { label: 'Check wry repository', cmd: 'git clone https://github.com/tauri-apps/wry.git' }
    ],
    notes: 'Prioritize Option 1 (Tauri + WebView2) for $0 maintenance overhead. Keep Zen rebase as fallback if deep extension APIs are required.',
    updatedAt: '2026-10-04T20:37:00Z'
  },
  {
    id: 'fluent-ui-kit',
    title: 'Fluent & Mica Shared UI Kit',
    subtitle: 'Design System & Component Library for Windows Native Web Apps',
    category: 'Design System',
    status: 'in_progress',
    priority: 'P1',
    techStack: ['CSS Variables', 'Tailwind CSS', 'Mica / Acrylic DWM', 'Segoe UI Variable'],
    description: 'Shared design tokens, custom window chrome, dark translucent card primitives, and film-grain overlays powering all suite applications.',
    problemStatement: 'Building multiple desktop apps without a cohesive design language leads to styling divergence, duplicate CSS, and inconsistent window borders.',
    architectureNotes: 'Leverages DWM system backdrop types (Mica / Acrylic) through Tauri window vibrancy. Surfaces use 16px corner radii with 1px low-contrast borders (rgba(255,255,255,0.08)) and subtle film grain overlay.',
    license: 'MIT',
    milestones: [
      { id: 'u1', text: 'Define color palette, typography (Segoe UI Variable), and elevation tokens', completed: true },
      { id: 'u2', text: 'Implement Mica / Acrylic backdrop blur and film grain noise overlay', completed: true },
      { id: 'u3', text: 'Build custom window titlebar with version pill and draggable regions', completed: false },
      { id: 'u4', text: 'Package components into shared `ui/fluent` monorepo module', completed: false }
    ],
    upstreamRefs: [
      { name: 'Microsoft Fluent 2 Design System', url: 'https://fluent2.microsoft.design/' },
      { name: 'OpenMouse UI Reference', url: 'https://x.com/openmouseapp/status/2106791463380005158' }
    ],
    notes: 'Ensures that Aether, OpenMouse Companion, and Aether Browser look like a native first-party Windows 11 overhaul suite.',
    updatedAt: '2026-10-04T20:19:00Z'
  },
  {
    id: 'showcase-website',
    title: 'Aether Suite Showcase Website',
    subtitle: 'Central Hub & Distribution Landing Page',
    category: 'Web / Marketing',
    status: 'backlog',
    priority: 'P3',
    techStack: ['Astro', 'Tailwind CSS', 'GitHub Pages / Cloudflare Pages'],
    description: 'Minimalist, fast landing page displaying app features, screenshots, documentation, and live download links dynamically fetched from GitHub Releases.',
    problemStatement: 'Open-source tools need a credible, cohesive web presence to build user trust without incurring hosting expenses.',
    architectureNotes: 'Zero-cost static generation deployed on GitHub Pages or Cloudflare Pages (`pages.dev`). Uses GitHub REST API to display real-time version tags and asset download counts.',
    license: 'MIT',
    milestones: [
      { id: 's1', text: 'Design hero section with Mica card mockups and app interactive preview', completed: false },
      { id: 's2', text: 'Create individual product detail pages for Debloater, Mouse Tool, and Browser', completed: false },
      { id: 's3', text: 'Integrate GitHub Releases API for 1-click installer download buttons', completed: false },
      { id: 's4', text: 'Deploy to Cloudflare Pages / GitHub Pages on custom domain', completed: false }
    ],
    upstreamRefs: [
      { name: 'Astro Web Framework', url: 'https://astro.build/' }
    ],
    notes: 'Keep design consistent with the desktop app: dark theme, subtle wallpaper glow, grain, and high typography polish.',
    updatedAt: '2026-10-04T20:32:00Z'
  },
  {
    id: 'zero-dollar-pipeline',
    title: 'Zero-Dollar CI/CD & Signing Pipeline',
    subtitle: 'Automated Multi-Arch Builds, Signing, and Winget Distribution',
    category: 'DevOps & Tooling',
    status: 'planned',
    priority: 'P2',
    techStack: ['GitHub Actions', 'SignPath Foundation', 'winget', 'PowerShell'],
    description: 'End-to-end automated pipeline building release installers, signing binaries for free to bypass SmartScreen warnings, and publishing to the Windows Package Manager.',
    problemStatement: 'Commercial code signing certificates cost hundreds of dollars per year. Unsigned Windows apps trigger severe SmartScreen warnings that scare users away.',
    architectureNotes: 'Utilizes SignPath Foundation for free HSM-backed code signing certificates for qualifying open-source repositories. GitHub Actions handles release artifacts and publishes to winget-pkgs.',
    license: 'MIT',
    milestones: [
      { id: 'd1', text: 'Configure GitHub Actions matrix build for Tauri v2 Windows x64 and ARM64', completed: false },
      { id: 'd2', text: 'Submit SignPath Foundation open-source code signing application', completed: false },
      { id: 'd3', text: 'Automate winget manifest generation and PR submission on release tags', completed: false }
    ],
    upstreamRefs: [
      { name: 'SignPath Foundation', url: 'https://signpath.org/' },
      { name: 'Winget Releaser Action', url: 'https://github.com/vedantmgoyal2009/winget-releaser' }
    ],
    notes: 'SignPath eliminates the biggest financial barrier in native Windows development.',
    updatedAt: '2026-10-04T20:37:00Z'
  }
];
