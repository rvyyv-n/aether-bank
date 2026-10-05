import type { ProjectIdea } from '../types';

export const INITIAL_PROJECTS: ProjectIdea[] = [
  {
    id: 'bookcook',
    title: 'Bookcook',
    subtitle: 'Hands-free voice cookbook you can talk to',
    category: 'App',
    status: 'shipped',
    priority: 'P0',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Tauri', 'Web Speech API', 'Dexie.js'],
    description: 'Voice-first family cookbook designed for busy hands and reading glasses: large typography, big targets, hands-free cooking mode with voice timers, multi-skin design system (5 skins), and local-first storage.',
    problemStatement: 'Cooking with dirty hands makes phone interaction messy, and family recipes told orally get lost unless transcribed naturally with personal voice context.',
    architectureNotes: 'Vite + React 19 + TypeScript. Local Dexie IndexedDB repository pattern. Rule-based natural language recipe parser for ingredients/timers. PWA and Tauri desktop/mobile builds.',
    path: 'projects/bookcook',
    license: 'MIT',
    milestones: [
      { id: 'b1', text: 'Scaffold, router, and Dexie IndexedDB repository layer', completed: true },
      { id: 'b2', text: 'Rule-based ingredient, step, and timer parser engine', completed: true },
      { id: 'b3', text: 'Five-skin adaptive design system (light/dark, large/huge text)', completed: true },
      { id: 'b4', text: 'Hands-free Cook Mode with voice timer controls and speaking slot', completed: true },
      { id: 'b5', text: 'Family sharing link export and backup/restore subsystem', completed: true },
      { id: 'b6', text: 'Heirloom skin pressed-card aesthetic and v1.4.0 release', completed: true }
    ],
    upstreamRefs: [
      { name: 'Live Web App', url: 'https://bookcook.pages.dev/' },
      { name: 'Product Website', url: 'https://getbookcook.pages.dev/' },
      { name: 'GitHub Repo', url: 'https://github.com/rvyyv-n/bookcook' }
    ],
    commands: [
      { label: 'Start dev server', cmd: 'npm run dev' },
      { label: 'Run parser tests', cmd: 'npm run parse:score' },
      { label: 'Typecheck and build', cmd: 'npm run build' }
    ],
    notes: 'Released v1.4.0. Screen checks isolate each worktree on its own port. Heirloom look refined.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'rise',
    title: 'Rise',
    subtitle: 'Block-based diet planner, one tick at a time',
    category: 'App',
    status: 'shipped',
    priority: 'P0',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Tauri', 'Capacitor', 'IndexedDB'],
    description: 'Minimalist meal-planning app that eliminates tedious calorie weighing in favor of pre-planned blocks, daily ticks, weekly weigh-ins, and local-first privacy.',
    problemStatement: 'Conventional food tracking apps demand weighing every ingredient and typing search queries, causing user churn within two weeks.',
    architectureNotes: 'Local-first offline state machine. Cross-platform build targets web (PWA), desktop (Tauri), and Android APK. Zero-telemetry storage model.',
    path: 'projects/diet-tracker',
    license: 'MIT',
    milestones: [
      { id: 'r1', text: 'Initial meal block planner and daily checklist state', completed: true },
      { id: 'r2', text: 'Weekly weigh-in progress calculation and trend visualization', completed: true },
      { id: 'r3', text: 'Tauri desktop and Android Capacitor build configuration', completed: true },
      { id: 'r4', text: 'v3.0 design overhaul across passes 63-93', completed: true },
      { id: 'r5', text: 'Release v3.0.0 with full changelog audit and testing suite', completed: true },
      { id: 'r6', text: 'Post-v3 phone pass for storage-full banner & reminders', completed: false }
    ],
    upstreamRefs: [
      { name: 'Product Website', url: 'https://getrise.pages.dev' },
      { name: 'Live Web App', url: 'https://rvyyv-n.github.io/diet-tracker/' },
      { name: 'GitHub Releases', url: 'https://github.com/rvyyv-n/diet-tracker/releases/latest' }
    ],
    commands: [
      { label: 'Start dev server', cmd: 'npm run dev' },
      { label: 'Run test suite', cmd: 'npm test' },
      { label: 'Build web & desktop', cmd: 'npm run build' }
    ],
    notes: 'v3.0.0 shipped 2026-10-02. Recent commits linked website as primary entrance.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'rise-site',
    title: 'Rise Website',
    subtitle: 'Zero-framework marketing site for Rise',
    category: 'Web',
    status: 'shipped',
    priority: 'P1',
    techStack: ['HTML5', 'Vanilla CSS', 'Vanilla JavaScript', 'Cloudflare Pages'],
    description: 'Ultra-lean landing page, privacy policy, and 404 for Rise. Built with raw semantic HTML/CSS tokens, zero framework dependencies, and zero third-party requests.',
    problemStatement: 'Product marketing pages frequently bloat with heavy client bundles and external tracking scripts.',
    architectureNotes: 'Zero-dependency static site compiled from token design exports. Deployed straight to Cloudflare Pages via automated GitHub Actions workflow.',
    path: 'projects/rise-site',
    license: 'MIT',
    milestones: [
      { id: 'rs1', text: 'Port landing page 1:1 from design token exports', completed: true },
      { id: 'rs2', text: 'Implement Reel Dark theme matching app styling', completed: true },
      { id: 'rs3', text: 'Privacy and 404 documentation pages', completed: true },
      { id: 'rs4', text: 'Automated release fallback script and maintainer deploy tooling', completed: true },
      { id: 'rs5', text: 'Continuous deployment via Cloudflare Pages', completed: true }
    ],
    upstreamRefs: [
      { name: 'Live Site', url: 'https://getrise.pages.dev' },
      { name: 'GitHub Repo', url: 'https://github.com/rvyyv-n/rise-site' }
    ],
    commands: [
      { label: 'Preview locally', cmd: 'npx serve public' },
      { label: 'Run test scripts', cmd: 'npm test' }
    ],
    notes: 'Zero framework, 0 external requests. Perfectly faithful to Figma design tokens.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'portfolio-site',
    title: 'Terminal Portfolio',
    subtitle: 'True black terminal-style developer portfolio & design tokens',
    category: 'Web',
    status: 'in_progress',
    priority: 'P1',
    techStack: ['HTML5', 'CSS Design Tokens', 'Modern CSS', 'Monospace'],
    description: 'Ultra-minimal developer homepage and visual design system. Pure #000000 base, singular interactive green accent, monospace typography, and zero decorative noise.',
    problemStatement: 'Modern developer portfolios are overloaded with bloated 3D graphics and distraction instead of clear terminal-aesthetic typography.',
    architectureNotes: 'Custom token engine (tokens.css, tokens.json). Semantic layout governed by whitespace rather than heavy card containers. Respects prefers-reduced-motion.',
    path: 'projects/portfolio-site',
    license: 'MIT',
    milestones: [
      { id: 'ps1', text: 'Establish true black (#000000) base and single green accent rules', completed: true },
      { id: 'ps2', text: 'Extract tokens.css and tokens.json design system', completed: true },
      { id: 'ps3', text: 'Draft interactive terminal frontpage mockups', completed: true },
      { id: 'ps4', text: 'Assemble multi-section layout with project showcases', completed: false },
      { id: 'ps5', text: 'Wire static deployment and custom domain', completed: false }
    ],
    upstreamRefs: [
      { name: 'Design Tokens', url: 'design-system/tokens.json' },
      { name: 'Visual Spec', url: 'design-system/style-guide.md' }
    ],
    commands: [
      { label: 'Preview mockup', cmd: 'npx serve mockups' }
    ],
    notes: 'Strictly anonymous in Banker. Monospace typography with single 1s step-end cursor blink.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'aether',
    title: 'Aether',
    subtitle: 'Ultra-low-latency 360Hz media player & clip review tool',
    category: 'Media',
    status: 'in_progress',
    priority: 'P0',
    techStack: ['C# 13', '.NET 9', 'Native AOT', 'WinUI 3', 'DirectX 11', 'libmpv', 'FFmpeg'],
    description: 'High-framerate (144Hz–360Hz) Windows 11 video player engineered for sub-millisecond competitive clip analysis, lossless stream-copy trimming, and zero-friction LAN streaming.',
    problemStatement: 'Standard media players suffer from airspace composition issues, high presentation latency, and clumsy trimming tools for competitive gameplay analysis.',
    architectureNotes: 'WinUI 3 SwapChainPanel hosting DXGI flip-model swap chain (ID3D11Device5). libmpv C-ABI rendering pipeline with d3d11va hardware acceleration. Sub-300ms FFmpeg stream-copy trim engine. In-memory Kestrel HTTP 206 server.',
    path: 'repos/aether',
    license: 'MIT',
    milestones: [
      { id: 'ae1', text: 'Pass 1: Direct3D 11 device manager & DXGI swapchain presenter', completed: true },
      { id: 'ae2', text: 'Pass 2: WinUI 3 SwapChainPanel native interop and Mica chrome', completed: true },
      { id: 'ae3', text: 'Pass 3: libmpv C-ABI wrapper & low-latency render event loop', completed: true },
      { id: 'ae4', text: 'Pass 4: Bidirectional frame stepping & Minecraft tick HUD', completed: false },
      { id: 'ae5', text: 'Pass 5: Sub-300ms FFmpeg lossless trim and drag-out clip drawer', completed: false },
      { id: 'ae6', text: 'Pass 6: Embedded Kestrel LAN streamer with QR code pairing', completed: false }
    ],
    upstreamRefs: [
      { name: 'libmpv C-API Reference', url: 'https://github.com/mpv-player/mpv' },
      { name: 'Windows App SDK', url: 'https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/' }
    ],
    commands: [
      { label: 'Build solution', cmd: 'dotnet build AetherPlayer.sln' },
      { label: 'Run unit tests', cmd: 'dotnet test tests/Aether.Core.Tests' }
    ],
    notes: 'Complete v3 specification with multi-agent orchestration setup.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'catgen',
    title: 'CATGEN',
    subtitle: 'Terminal ASCII art studio & CLI converter',
    category: 'CLI',
    status: 'shipped',
    priority: 'P1',
    techStack: ['Go', 'Bubble Tea', 'Lipgloss', 'Image Processing', 'ANSI'],
    description: 'Terminal-native ASCII cat art generator and studio. Features an interactive Bubble Tea two-pane TUI, arbitrary image converter, 24-bit TrueColor ANSI styling, and Discord 34-column codeblock export.',
    problemStatement: 'Web-based ASCII converters require browsers and network requests; terminal users want fast local conversion with interactive visual tweaking.',
    architectureNotes: 'Pure Go image-to-ASCII converter with aspect-ratio correction, custom density ramps (Blocks, Braille, Binary), and Lipgloss styling. Single binary CLI and TUI.',
    path: 'repos/catgen',
    license: 'MIT',
    milestones: [
      { id: 'cg1', text: 'Core ASCII conversion engine with font aspect correction', completed: true },
      { id: 'cg2', text: 'Bubble Tea 2-pane interactive TUI studio with live preview', completed: true },
      { id: 'cg3', text: 'Discord codeblock formatter with 16-color ANSI output', completed: true },
      { id: 'cg4', text: 'Arbitrary image CLI flag ingestion and batch exports', completed: true },
      { id: 'cg5', text: 'Color themes: Amber, Matrix, Cyber, Cyberpunk, Grayscale', completed: true },
      { id: 'cg6', text: 'Single-binary release packaging and v1.0.0 tag', completed: true }
    ],
    upstreamRefs: [
      { name: 'GitHub Repo', url: 'https://github.com/rvyyv-n/catgen' },
      { name: 'Bubble Tea Framework', url: 'https://github.com/charmbracelet/bubbletea' }
    ],
    commands: [
      { label: 'Run TUI', cmd: 'go run ./cmd/catgen' },
      { label: 'Build binary', cmd: 'go build -o catgen ./cmd/catgen' }
    ],
    notes: 'Released v1.0.0. Clean terminal experience with zero external runtime dependencies.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'learning-py',
    title: 'Learning Python',
    subtitle: 'CS50P course follow-along and problem set solutions',
    category: 'Tools',
    status: 'shipped',
    priority: 'P2',
    techStack: ['Python 3', 'pytest', 'Rich', 'Regex', 'OOP'],
    description: 'Complete implementation of Harvard CS50 Introduction to Programming with Python, including all 10 lecture notes, 30+ problem sets, unit test suites, and final capstone project.',
    problemStatement: 'Building rigorous fundamentals in Python syntax, object-oriented design, regex pattern matching, and automated testing.',
    architectureNotes: 'Structured modular repository: lectures 0-9 with notes, psets 0-8 with unit test coverage, and a capstone application in pset 9.',
    path: 'repos/learning-py',
    license: 'MIT',
    milestones: [
      { id: 'lp1', text: 'Weeks 0-2: Functions, variables, conditionals, and loops', completed: true },
      { id: 'lp2', text: 'Weeks 3-4: Exceptions, file validation, and external libraries', completed: true },
      { id: 'lp3', text: 'Week 5: Unit testing problem sets with pytest', completed: true },
      { id: 'lp4', text: 'Weeks 6-7: File I/O parsing and regular expressions', completed: true },
      { id: 'lp5', text: 'Week 8: Object-oriented programming principles and classes', completed: true },
      { id: 'lp6', text: 'Week 9: Capstone final project and automated test suite', completed: true }
    ],
    upstreamRefs: [
      { name: 'GitHub Repo', url: 'https://github.com/rvyyv-n/learning-py' },
      { name: 'CS50P Course', url: 'https://cs50.harvard.edu/python/2022/' }
    ],
    commands: [
      { label: 'Run pytest', cmd: 'pytest psets/' },
      { label: 'Run final project', cmd: 'python psets/week-9/project.py' }
    ],
    notes: '100% completed coursework with clean git history.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'readme-ideas',
    title: 'Readme Ideas Gallery',
    subtitle: 'Interactive showcase of GitHub profile readme concepts',
    category: 'Design',
    status: 'planned',
    priority: 'P3',
    techStack: ['HTML5', 'CSS Grid', 'Markdown', 'SVG'],
    description: 'Interactive gallery and testbed for five distinct GitHub profile layout styles: Minimal Mono, Terminal Box, Stat Cards, Bento Grid, and Compact Wireframe.',
    problemStatement: 'Designing GitHub profile readmes in Markdown directly is slow and lacks rapid side-by-side design comparison.',
    architectureNotes: 'Self-contained HTML5 workbench rendering five styled README options inside authentic GitHub dark-mode chrome frames.',
    path: 'repos/readme-ideas',
    license: 'MIT',
    milestones: [
      { id: 'ri1', text: 'Create GitHub container mockup with authentic dark theme CSS', completed: true },
      { id: 'ri2', text: 'Draft Version 1: Terminal Monospace layout', completed: true },
      { id: 'ri3', text: 'Draft Version 2: Compact horizontal pill layout', completed: true },
      { id: 'ri4', text: 'Draft Version 3: High-density bento grid layout', completed: false },
      { id: 'ri5', text: 'Export chosen layout to active profile repository', completed: false }
    ],
    upstreamRefs: [
      { name: 'Local Preview', url: 'readme-options.html' }
    ],
    commands: [
      { label: 'Open preview', cmd: 'start readme-options.html' }
    ],
    notes: 'Prototyping workbench for developer profile aesthetics.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'profile-readme',
    title: 'Profile README',
    subtitle: 'Active minimalist GitHub special repository',
    category: 'Design',
    status: 'shipped',
    priority: 'P2',
    techStack: ['Markdown', 'HTML', 'GitHub Flavored Markdown'],
    description: 'Minimalist GitHub special repository profile. Centered layout with muted typography, quiet spacing, and clean contact handles.',
    problemStatement: 'Standard GitHub profiles often suffer from cluttered animated widgets, skill badges, and cognitive overload.',
    architectureNotes: 'Single Markdown file utilizing semantic HTML center tags and subtle non-breaking spaces.',
    path: 'repos/profile-readme',
    license: 'MIT',
    milestones: [
      { id: 'pr1', text: 'Draft initial minimalist centered layout', completed: true },
      { id: 'pr2', text: 'Refine typography and spacing', completed: true },
      { id: 'pr3', text: 'Deploy to live GitHub profile page', completed: true }
    ],
    upstreamRefs: [
      { name: 'GitHub Profile', url: 'https://github.com/rvyyv-n' }
    ],
    commands: [
      { label: 'Check git status', cmd: 'git status -s' }
    ],
    notes: 'Kept strictly minimal with zero noisy SVG tracking counters.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'vulkan',
    title: 'Voolkan',
    subtitle: 'Legacy-hardware VulkanMod fork for competitive sword PvP',
    category: 'Gaming',
    status: 'spike',
    priority: 'P2',
    techStack: ['Java', 'Vulkan API', 'LWJGL', 'C++'],
    description: 'Unofficial lightweight fork of VulkanMod tailored for legacy GPUs and competitive 1.8.9/1.20+ sword PvP mechanics, focused on minimizing input delay and frame timing spikes.',
    problemStatement: 'Default Minecraft OpenGL rendering suffers from micro-stutters and input lag during intensive PvP encounters on legacy graphics architectures.',
    architectureNotes: 'Vulkan pipeline swapping out legacy GL state machines. Optimized memory allocator and custom draw batching.',
    path: 'repos/vulkan',
    license: 'LGPL-3.0',
    milestones: [
      { id: 'vk1', text: 'Fork VulkanMod and configure initial build harness', completed: true },
      { id: 'vk2', text: 'Profile frame-time latency on legacy GPU configurations', completed: false },
      { id: 'vk3', text: 'Strip non-essential rendering overhead for competitive PvP', completed: false },
      { id: 'vk4', text: 'Implement swapchain low-latency waitable sync', completed: false }
    ],
    upstreamRefs: [
      { name: 'Upstream VulkanMod', url: 'https://github.com/xCollateral/VulkanMod' },
      { name: 'GitHub Repo', url: 'https://github.com/rvyyv-n/voolkan' }
    ],
    commands: [
      { label: 'Git status', cmd: 'git status -s' }
    ],
    notes: 'Targeted specifically for competitive frame consistency.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'banker',
    title: 'Banker',
    subtitle: 'Minimal project and idea vault',
    category: 'Tools',
    status: 'shipped',
    priority: 'P0',
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Vite', 'Local-First'],
    description: 'Local-first project management vault and developer CRM. Features 6-stage Kanban board, dense CRM table view, 4-phase roadmap timeline, slide-over spec drawers, OLED dark mode, and zero external tracking.',
    problemStatement: 'Jira and Linear are too heavy for solo developer projects; notes apps lack structure, stages, and quick terminal command copy shortcuts.',
    architectureNotes: 'React 19 + TypeScript + Vite with Tailwind CSS v4. Synchronous localStorage state engine with JSON import/export. Headless Chrome screenshot pipeline.',
    path: 'repos/sandbox/banker',
    license: 'MIT',
    milestones: [
      { id: 'bk1', text: 'Core 6-stage Kanban board with quick stage navigation', completed: true },
      { id: 'bk2', text: 'Slide-over project detail drawer with milestone checklists & scratchpad', completed: true },
      { id: 'bk3', text: 'Compact CRM table view with inline stage controls & filtering', completed: true },
      { id: 'bk4', text: 'Four-phase roadmap view and zero-cloud architecture', completed: true },
      { id: 'bk5', text: 'OLED dark mode and crisp light mode theme switching', completed: true },
      { id: 'bk6', text: 'Deploy production static site to GitHub Pages', completed: true }
    ],
    upstreamRefs: [
      { name: 'GitHub Pages Live', url: 'https://rvyyv-n.github.io/banker/' },
      { name: 'GitHub Repo', url: 'https://github.com/rvyyv-n/banker' }
    ],
    commands: [
      { label: 'Run dev', cmd: 'npm run dev' },
      { label: 'Build production', cmd: 'npm run build' },
      { label: 'Capture screenshots', cmd: 'node capture.cjs' }
    ],
    notes: 'The current application vault itself.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 't3code-charcoal-theme',
    title: 'T3 Code Charcoal Theme',
    subtitle: 'Warm charcoal and paper-light themes for T3 Code',
    category: 'Design',
    status: 'shipped',
    priority: 'P2',
    techStack: ['JSON', 'Theme Engine', 'Design Tokens'],
    description: 'Complete theme definitions bringing warm charcoal dark theme (#151515) and paper-light palette (#fcfcfb) directly into T3 Code.',
    problemStatement: 'Default code editor themes often rely on cold blue-grays rather than warm, eye-friendly charcoal tones.',
    architectureNotes: 'JSON theme definition conforming to T3 Code editor styling specifications for canvas, chrome, toolbar, surface, syntax tokens, and borders.',
    path: 'repos/sandbox/t3code-theme',
    license: 'MIT',
    milestones: [
      { id: 'th1', text: 'Extract warm dark canvas (#151515) and surface tokens', completed: true },
      { id: 'th2', text: 'Build charcoal-dark.json with full syntax highlighting palette', completed: true },
      { id: 'th3', text: 'Build warm-light.json matching clean paper aesthetics', completed: true },
      { id: 'th4', text: 'Test contrast ratios across code blocks and sidebar chrome', completed: true }
    ],
    upstreamRefs: [
      { name: 'T3 Code Themes Spec', url: 'https://github.com/pingdotgg/t3code' }
    ],
    commands: [
      { label: 'Inspect dark theme', cmd: 'cat themes/dark.json' },
      { label: 'Inspect light theme', cmd: 'cat themes/light.json' }
    ],
    notes: 'Directly usable inside T3 Code configuration.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 't3code-icons',
    title: 'T3 Code Icons',
    subtitle: 'Alternative minimalist and stylized app icons for T3 Code',
    category: 'Design',
    status: 'shipped',
    priority: 'P2',
    techStack: ['Figma', 'PNG', 'ICO', 'Visual Design'],
    description: 'Curated replacement icon pack for T3 Code. Features clean minimalist variants (Graphite, Midnight, Accent, Coral) and stylized tactile variants (Neon, Gummy).',
    problemStatement: 'The default nightly app icon was visually loud on the dock and taskbar.',
    architectureNotes: 'High-resolution PNG and ICO icon assets rendered at multiple resolutions with custom shadow and material shaders.',
    path: 'repos/sandbox/t3code-icons',
    license: 'MIT',
    milestones: [
      { id: 'ic1', text: 'Design clean minimalist set: Graphite, Midnight, Accent, Coral', completed: true },
      { id: 'ic2', text: 'Design stylized tactile set: Neon tubing and Gummy jelly', completed: true },
      { id: 'ic3', text: 'Render multi-resolution export assets (16px to 512px)', completed: true },
      { id: 'ic4', text: 'Document visual catalog and previews in README.md', completed: true }
    ],
    upstreamRefs: [
      { name: 'Preview catalog', url: 'preview.png' },
      { name: 'Stylized catalog', url: 'preview-styled.png' }
    ],
    commands: [
      { label: 'List icons', cmd: 'dir icons' }
    ],
    notes: 'Complete icon replacements ready to drop into editor installations.',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'usage-limits-mod',
    title: 'Usage Limits Plugin',
    subtitle: 'CLI prompt extension for inline plan usage limits',
    category: 'Tools',
    status: 'polishing',
    priority: 'P1',
    techStack: ['TypeScript', 'Node.js', 'CLI Plugin API'],
    description: 'Command-line agent plugin that displays plan token and usage limits above prompt queries and registers a dedicated /limits interactive command.',
    problemStatement: 'Developers working with AI agent CLIs often hit plan caps unexpectedly without continuous visual feedback of their consumption.',
    architectureNotes: 'TypeScript plugin module utilizing the agent hooks API (hooks.json, register.js) to intercept prompt events and fetch live usage telemetry.',
    path: 'repos/sandbox/usage-limits-mod',
    license: 'MIT',
    milestones: [
      { id: 'ul1', text: 'Scaffold plugin manifest (.agent-plugin/plugin.json)', completed: true },
      { id: 'ul2', text: 'Configure TypeScript definitions and compiler options', completed: true },
      { id: 'ul3', text: 'Implement hooks/register.js lifecycle interceptors', completed: true },
      { id: 'ul4', text: 'Implement /limits terminal command handler', completed: false },
      { id: 'ul5', text: 'Test live telemetry against plan API responses', completed: false }
    ],
    upstreamRefs: [
      { name: 'Plugin Hooks Spec', url: 'hooks/hooks.json' }
    ],
    commands: [
      { label: 'Build plugin', cmd: 'npx tsc' }
    ],
    notes: 'Adds prompt banner and /limits command to terminal agent.',
    updatedAt: '2026-10-05T12:00:00Z'
  }
];
