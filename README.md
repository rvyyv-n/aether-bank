<div align="center">

<a href="https://rvyyv-n.github.io/banker/">
  <img src="icon.svg" alt="Banker icon" width="96" height="96" />
</a>

# Banker

**Minimal project and idea vault.**

A local-first developer workbench for tracking software tools, technical specifications, and roadmap milestones.

[**Open the app**](https://rvyyv-n.github.io/banker/) • [GitHub](https://github.com/rvyyv-n/banker) • [License: MIT](LICENSE)

</div>

<a href="https://rvyyv-n.github.io/banker/">
  <img src="screenshots/banker-oled-dark.png" alt="Banker Kanban Board in OLED Dark mode" width="100%" />
</a>

## Contents

- [What it does](#what-it-does)
- [Views](#views)
- [Running locally with your own projects](#running-locally-with-your-own-projects)
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

The default high-level view. Six stages organize active work across a fluid
full-width grid with task completion meters, tech stack tags, next milestone
previews, dev command shortcuts, and priority badges.

<a href="https://rvyyv-n.github.io/banker/">
  <img src="screenshots/banker-oled-dark.png" alt="Banker Kanban board" width="100%" />
</a>

### Table

A dense, high-efficiency developer data grid designed for quick audits. Scan
repositories, inspect active milestones, copy terminal commands and folder paths
in one click, and update project stages inline.

<a href="https://rvyyv-n.github.io/banker/">
  <img src="screenshots/banker-table.png" alt="Banker Table view" width="100%" />
</a>

### Project drawer

Clicking any card opens a slide-over panel with the full technical specification,
interactive milestone checklists, linked workspaces, terminal commands, and an
editable scratchpad.

<a href="https://rvyyv-n.github.io/banker/">
  <img src="screenshots/banker-drawer.png" alt="Banker project detail drawer" width="100%" />
</a>

### Light mode

Crisp, paper-like neutral styling with stark typography. Press <kbd>T</kbd>
anywhere or tap the sun/moon icon to switch between OLED Dark and Light mode.

<a href="https://rvyyv-n.github.io/banker/">
  <img src="screenshots/banker-light-mode.png" alt="Banker in crisp light mode" width="100%" />
</a>

### Mobile

Responsive mobile layout built for quick capture and status audits on the go.

<p align="center">
  <a href="https://rvyyv-n.github.io/banker/">
    <img src="screenshots/banker-mobile-dark.png" alt="Banker mobile in OLED dark mode" width="48%" />
  </a>
  &nbsp;
  <a href="https://rvyyv-n.github.io/banker/">
    <img src="screenshots/banker-mobile-light.png" alt="Banker mobile in light mode" width="48%" />
  </a>
</p>

## Running locally with your own projects

To run Banker on your local machine and point it to your repositories:

1. **Clone and install**:
   ```sh
   git clone https://github.com/rvyyv-n/banker.git
   cd banker
   npm install
   ```

2. **Start the local server**:
   ```sh
   npm run dev
   ```
   Open `http://localhost:3333/`.

3. **Managing your projects**:
   - **Through the UI**: Use the `+` button (or press <kbd>N</kbd>) to add your own local projects with their directory paths and dev commands.
   - **Pre-seeding via code**: Edit `src/data/initialData.ts` to define your own default catalog of repositories and initial milestones.
   - **Backups & Sync**: Use **Export** in the header to save a `banker-vault.json` snapshot of your project state anytime.

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
icon.svg                  clean vector mark for repository and documentation
icon.png                  512x512 high-resolution app icon
src/
  App.tsx                 app shell, theme provider, and view orchestrator
  types.ts                typed project schema, status enums, and milestones
  index.css               pure OLED dark (#000000) and paper light CSS tokens
  data/
    initialData.ts        initial project catalog and milestone seeds
  components/
    Header.tsx            search bar, status filters, priority filter, and actions
    BankerLogo.tsx        minimal geometric vault vector mark
    KanbanBoard.tsx       six-column stage board with dev shortcuts & milestones
    TableView.tsx         high-density CRM data grid with 1-click command & path copy
    RoadmapView.tsx       four-phase execution timeline
    ProjectDrawer.tsx     slide-over drawer with checklists and scratchpad
    NewProjectModal.tsx   fast idea capture modal
screenshots/              retina edge-to-edge screenshots of views and mobile layout
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
