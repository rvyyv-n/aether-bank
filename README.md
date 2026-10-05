# Banker

Banker is a local-first project and idea vault for tracking tools, technical
specifications, and roadmap milestones.

**[Open the app](https://rvyyv-n.github.io/aether-bank/)**. There is nothing to
sign up for, no analytics, and your data never leaves your device.

<p align="center">
  <img src="screenshots/banker-oled-dark.png" alt="Banker in OLED Dark mode showing the six-stage Kanban board" width="700" />
</p>

## Contents

- [What it does](#what-it-does)
- [Views](#views)
- [Privacy and storage](#privacy-and-storage)
- [How it's built](#how-its-built)
- [Development](#development)
- [License](#license)

## What it does

Banker provides a single place to track software tools through their entire
lifecycle: from initial spark and architectural spike through execution,
polishing, and release.

- **Fast stage progression.** Move projects through six distinct phases
  (*Backlog*, *Planned*, *Spike / R&D*, *In Progress*, *Polishing*, and
  *Shipped*) with one-click navigation arrows.
- **Checklists with live progress.** Every project tracks its milestones,
  updating progress meters in real time.
- **Specs and decisions.** Keep problem statements, architectural rationale,
  and upstream references attached directly to each project card.
- **Terminal shortcuts.** Store and copy relevant working directory paths,
  git status queries, and dev commands in one tap.
- **Scratchpad.** Write notes and brainstorm thoughts directly inside each
  drawer without switching apps.
- **Zero data loss.** Everything syncs to browser storage instantly, with
  one-click JSON export for backups and cross-machine handoffs.

## Views

### Board

The default high-level view. Six stages organize your active backlog and
running work with task completion meters, tech stack tags, and priority badges.

<p align="center">
  <img src="screenshots/banker-oled-dark.png" alt="Banker Kanban board" width="620" />
</p>

### Project drawer

Clicking any card opens a slide-over panel with the full technical specification,
interactive milestone checklists, linked workspaces, terminal commands, and an
editable scratchpad.

<p align="center">
  <img src="screenshots/banker-drawer.png" alt="Banker project detail drawer showing Aether debloater specifications" width="620" />
</p>

### Table

A compact CRM data grid designed for quick audits. Filter by category, scan
repositories, and update project stages directly from inline dropdowns.

<p align="center">
  <img src="screenshots/banker-table.png" alt="Banker CRM table view in light mode" width="620" />
</p>

### Roadmap

A four-phase chronological delivery plan mapping projects to execution
sprints while maintaining a strict zero-dollar ($0) infrastructure footprint.

<p align="center">
  <img src="screenshots/banker-light-mode.png" alt="Banker in crisp light mode" width="620" />
</p>

### OLED Dark & Light

- **OLED Dark.** Pure pitch black (`#000000`) with subtle wireframe borders,
  built for high-contrast mobile reading and OLED displays.
- **Light mode.** Crisp, paper-like neutral styling with stark typography.
- Press <kbd>T</kbd> anywhere or tap the sun/moon icon to switch.

<p align="center">
  <img src="screenshots/banker-mobile.png" alt="Banker mobile view on a phone" width="280" />
</p>

## Privacy and storage

Banker is strictly local-first. Your ideas, notes, status changes, and
custom projects stay entirely in your browser's local storage.

- No external analytics, telemetry, or user accounts.
- Zero tracking scripts or third-party network requests.
- Export your complete vault to JSON anytime using the **Export** button in the
  header.

## How it's built

Built with React 19, TypeScript, and Vite with Tailwind CSS v4.

```
src/
  App.tsx                 app shell, theme provider, and view orchestrator
  types.ts                typed project schema, status enums, and milestones
  index.css               OLED dark and clean light CSS custom properties
  data/
    initialData.ts        initial project catalog (Aether, OpenMouse, Browser)
  components/
    Header.tsx            search bar, status counters, theme toggle, and actions
    BankerLogo.tsx        minimal geometric vault vector mark
    KanbanBoard.tsx       six-column stage board with fast transitions
    TableView.tsx         high-density CRM data grid with inline status selection
    RoadmapView.tsx       four-phase execution timeline
    ProjectDrawer.tsx     slide-over drawer with checklists and scratchpad
    NewProjectModal.tsx   fast idea capture modal
screenshots/              retina screenshots of views and mobile layout
capture.cjs               automated headless Chrome screenshot capture script
server.cjs                lightweight standalone local static HTTP server
```

## Development

Needs Node 20+.

```sh
npm install
npm run dev
```

Open the address Vite prints (default `http://localhost:3333`).

| Command            | What it does                                                 |
| ------------------ | ------------------------------------------------------------ |
| `npm run dev`      | Start the Vite dev server with hot module reloading          |
| `npm run build`    | Typecheck and build the production bundle to `dist/`         |
| `npm run preview`  | Preview the production build locally with Vite               |
| `npm run serve`    | Run the standalone Node static server on port 3333           |
| `node capture.cjs` | Retake high-resolution screenshots via headless Chrome       |

### Keyboard shortcuts

| Key                | Action                              |
| ------------------ | ----------------------------------- |
| <kbd>N</kbd>       | Open the new project modal          |
| <kbd>T</kbd>       | Toggle between OLED dark and light  |
| <kbd>/</kbd>       | Focus the search filter             |
| <kbd>1</kbd>       | Switch to the Kanban board          |
| <kbd>2</kbd>       | Switch to the CRM table view        |
| <kbd>3</kbd>       | Switch to the Roadmap view          |
| <kbd>Esc</kbd>     | Close the active drawer or modal    |

## Deployment

Pushes to `main` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which checks out the repository, installs dependencies, builds the application,
and publishes the static bundle directly to GitHub Pages.

## License

[MIT](LICENSE) © rvyyv-n
