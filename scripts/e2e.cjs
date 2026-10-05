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
