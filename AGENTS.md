# Banker: agent rules

A local-first project and idea vault: React 19, TypeScript, Vite, Tailwind v4, lucide-react. Data lives in browser storage; no backend. `/usage.json` is served by a Vite plugin (`vite.config.ts`) from `scripts/usage-collector.cjs`, which reads local harness logs.

## Commands
```powershell
npm run dev             # Vite dev server, port 3333
npm run build           # tsc -b && vite build -> dist/
npm run check           # oxlint + build; run before handing work back
npm run test:e2e        # builds, then scripts/e2e.cjs
node capture.cjs        # README screenshots from dist/ (build first; needs Chrome and puppeteer-core)
npm run host            # builds, then starts server.cjs detached (scripts/host.cjs)
npm run host:status
npm run host:stop
```
`npm run host` detaches the server with a pid and log file in the temp folder, so the command returns at once. Use it, not `npm run serve` or `npm run dev`, whenever a server must outlive the command. Stop it with `npm run host:stop` when done.

## Rules
- Capture screenshots only for a visual change that tests or page text can't confirm. Rebuild first, since `capture.cjs` reads `dist/`.
- `scripts/usage-collector.cjs` reads private local logs. Never commit its output or any log content.
- Keep the app local-first: no CDNs, analytics or network calls for project data.

## Models and threads
- **Gemini Flash**: scouting, test runs, fast debug loops, CI.
- **Sonnet**: extended build passes and UI polish.
- **Opus**: architecture and ADRs, 1-3 turns per task. No file reading or test-fix loops.
- Retire a thread at 8 turns or 150k tokens: commit, then fork from a checkpoint or start fresh. Run large passes in a worktree.
- Fork checkpoints replace auto-delegation loops. Don't chain `delegate_task` between models.
- Never leave a dev server or watcher running at the end of a turn. Use `npm run host` for anything that must stay up, then stop it.

## Commits
Author and committer are `rvyyv-n` only. No co-author, generated-by or assistant mentions in commits, PR text or files. Never `--no-verify`.
