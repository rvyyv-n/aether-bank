// Smoke test against the real server: starts server.cjs on a free port, checks
// every section on desktop and phone, then stops the server and exits.
// Run after a build: `npm run test:e2e`. Exits non-zero on any failure.
const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SECTIONS = ['Vault', 'Roadmap', 'Analytics', 'Usage'];
const DEADLINE_MS = 120000;

let server = null;
let browser = null;
const failures = [];

function check(ok, msg) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`);
  if (!ok) failures.push(msg);
}

// Contrast ratio of two CSS colours, resolved by the browser (WCAG 2 relative luminance)
const CONTRAST_PAIRS = [
  // [foreground var, background var, minimum ratio, label]
  ['--fg', '--bg', 7, 'text on page'],
  ['--fg-2', '--bg', 7, 'secondary text on page'],
  ['--fg-3', '--bg', 4.5, 'muted text on page'],
  ['--fg-3', '--surface', 4.5, 'muted text on cards'],
  ['--accent', '--bg', 3, 'accent on page'],
  ['--on-accent', '--accent', 4.5, 'button text on accent'],
];
const STATUS_DOTS = ['backlog', 'planned', 'spike', 'in_progress', 'polishing'].map((s) => `var(--st-${s})`);

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

function get(port, p) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port, path: p, timeout: 30000 }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      })
      .on('error', reject);
  });
}

async function waitForServer(port) {
  for (let i = 0; i < 100; i++) {
    try {
      await get(port, '/');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error(`server did not start on port ${port}`);
}

async function cleanup() {
  if (browser) await browser.close().catch(() => {});
  if (server && server.exitCode === null) server.kill();
}

async function visitSections(page, navSelector, label) {
  for (const name of SECTIONS) {
    const clicked = await page.evaluate(
      (sel, n) => {
        const btn = Array.from(document.querySelectorAll(`${sel} button`)).find((b) => b.innerText.trim().startsWith(n));
        if (!btn) return false;
        btn.click();
        return true;
      },
      navSelector,
      name,
    );
    check(clicked, `${label}: ${name} tab exists`);
    if (!clicked) continue;
    await new Promise((r) => setTimeout(r, 300));
    const text = await page.$eval('.main-content', (el) => el.innerText.trim().length).catch(() => 0);
    check(text > 20, `${label}: ${name} renders content`);
  }
}

async function main() {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}/`;
  server = spawn(process.execPath, ['server.cjs'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'ignore', 'pipe'],
    windowsHide: true,
  });
  let serverErr = '';
  server.stderr.on('data', (c) => (serverErr += c));
  await waitForServer(port);
  console.log(`server on ${base}`);

  const usage = await get(port, '/usage.json');
  let rows = null;
  try {
    rows = JSON.parse(usage.body).rows;
  } catch {
    /* reported below */
  }
  check(usage.status === 200 && Array.isArray(rows), `/usage.json returns rows (${Array.isArray(rows) ? rows.length : 'none'})`);

  browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  // Desktop
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: 'networkidle0' });
  const brand = await page.$eval('.brand strong', (el) => el.innerText).catch(() => '');
  check(brand === 'Banker', 'desktop: page loads with Banker header');
  await visitSections(page, '.section-tabs', 'desktop');
  const liveData = await page.evaluate(() => !document.body.innerText.includes('sample data'));
  check(liveData, 'desktop: usage page shows live data, not sample data');

  // Local-only repo endpoint: answers for known folders, refuses everything outside the code folders
  const repos = await get(port, '/repos.json?p=' + encodeURIComponent('C:/Windows') + '&p=' + encodeURIComponent('../../..'));
  let repoData = null;
  try {
    repoData = JSON.parse(repos.body);
  } catch {
    /* reported below */
  }
  check(
    repos.status === 200 && repoData && repoData.repos['C:/Windows'].found === false && repoData.repos['../../..'].found === false,
    '/repos.json refuses paths outside the code folders',
  );

  // Project page opens from a card and goes back
  await page.evaluate(() => document.querySelector('.section-tabs button')?.click());
  await new Promise((r) => setTimeout(r, 300));
  const hasCard = await page.evaluate(() => !!document.querySelector('.focus-card'));
  check(hasCard, 'desktop: vault shows active project cards');
  if (hasCard) {
    await page.evaluate(() => document.querySelector('.focus-card').click());
    await page.waitForSelector('[aria-label="Open as a page"]', { timeout: 3000 }).catch(() => {});
    await page.evaluate(() => document.querySelector('[aria-label="Open as a page"]')?.click());
    await new Promise((r) => setTimeout(r, 300));
    const onPage = await page.evaluate(() => !!document.querySelector('.project-layout') && !document.querySelector('[role="dialog"]'));
    check(onPage, 'desktop: project opens as a full page');
    await page.evaluate(() => Array.from(document.querySelectorAll('.page-head button')).find((b) => b.innerText.trim() === 'Back')?.click());
    await new Promise((r) => setTimeout(r, 300));
    const back = await page.evaluate(() => !document.querySelector('.project-layout'));
    check(back, 'desktop: Back returns to the vault');
  }

  // Theme contrast: every accent in dark and light
  for (const theme of ['dark', 'light']) {
    for (const accent of ['sand', 'sky', 'mint', 'mono']) {
      const result = await page.evaluate(
        (theme, accent, pairs, dots) => {
          const root = document.documentElement;
          if (theme === 'light') root.setAttribute('data-theme', 'light');
          else root.removeAttribute('data-theme');
          root.setAttribute('data-accent', accent);
          const probe = document.createElement('i');
          document.body.appendChild(probe);
          const rgb = (value) => {
            probe.style.color = '';
            probe.style.color = value;
            return getComputedStyle(probe).color.match(/[\d.]+/g).slice(0, 3).map(Number);
          };
          const lum = ([r, g, b]) => {
            const c = [r, g, b].map((v) => {
              v /= 255;
              return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
          };
          const ratio = (a, b) => {
            const [hi, lo] = [lum(rgb(a)), lum(rgb(b))].sort((x, y) => y - x);
            return (hi + 0.05) / (lo + 0.05);
          };
          const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
          const out = { fail: [], dots: [] };
          for (const [fg, bg, min, label] of pairs) {
            const r = ratio(css(fg), css(bg));
            if (r < min) out.fail.push(`${label} ${r.toFixed(2)} < ${min}`);
          }
          for (const d of dots) {
            const r = ratio(d, css('--bg'));
            if (r < 3) out.dots.push(`${d} ${r.toFixed(2)}`);
          }
          probe.remove();
          return out;
        },
        theme,
        accent,
        CONTRAST_PAIRS,
        STATUS_DOTS,
      );
      check(result.fail.length === 0, `contrast ${theme}/${accent}${result.fail.length ? ': ' + result.fail.join(', ') : ''}`);
      check(result.dots.length === 0, `status colours ${theme}/${accent}${result.dots.length ? ' under 3:1: ' + result.dots.join(', ') : ''}`);
    }
  }
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-accent', 'sand');
  });

  // Phone
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(base, { waitUntil: 'networkidle0' });
  const layout = await page.evaluate(() => {
    const visible = (sel) => {
      const el = document.querySelector(sel);
      return !!el && getComputedStyle(el).display !== 'none';
    };
    return {
      nav: visible('.mobile-nav'),
      tabs: visible('.section-tabs'),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  check(layout.nav, 'phone: bottom nav is visible');
  check(!layout.tabs, 'phone: desktop section tabs are hidden');
  check(layout.overflow <= 1, `phone: no sideways scroll (overflow ${layout.overflow}px)`);
  await visitSections(page, '.mobile-nav', 'phone');

  check(errors.length === 0, `no console or page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
  if (serverErr.trim()) check(false, `server stderr: ${serverErr.trim().slice(0, 300)}`);
}

const deadline = setTimeout(async () => {
  console.error(`FAIL timed out after ${DEADLINE_MS / 1000}s`);
  await cleanup();
  process.exit(1);
}, DEADLINE_MS);

main()
  .catch((e) => {
    check(false, `run error: ${e.message}`);
  })
  .finally(async () => {
    clearTimeout(deadline);
    await cleanup();
    console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nall checks passed');
    process.exit(failures.length ? 1 : 0);
  });
