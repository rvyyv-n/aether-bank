// Runs server.cjs in the background so the calling command exits straight away.
//   node scripts/host.cjs start | stop | status     (PORT env, default 3333)
// The server is detached with its output in a log file, so nothing holds the
// caller's terminal open. A pid file next to the log lets `stop` find it again.
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const PORT = Number(process.env.PORT) || 3333;
const ROOT = path.join(__dirname, '..');
const PID_FILE = path.join(os.tmpdir(), `banker-host-${PORT}.pid`);
const LOG_FILE = path.join(os.tmpdir(), `banker-host-${PORT}.log`);

function ping() {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: '/', timeout: 1000 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function readPid() {
  try {
    return Number(fs.readFileSync(PID_FILE, 'utf8')) || null;
  } catch {
    return null;
  }
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function lanUrls() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family === 'IPv4' && !a.internal) out.push(`http://${a.address}:${PORT}/`);
    }
  }
  return out;
}

function printUrls() {
  console.log(`Local: http://localhost:${PORT}/`);
  for (const u of lanUrls()) console.log(`LAN:   ${u}`);
}

async function start() {
  if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
    console.error('No build found. Run `npm run build` first.');
    process.exit(1);
  }
  if (await ping()) {
    console.log(`Already serving on port ${PORT}.`);
    printUrls();
    return;
  }
  const log = fs.openSync(LOG_FILE, 'w');
  const child = spawn(process.execPath, ['server.cjs'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    detached: true,
    stdio: ['ignore', log, log],
    windowsHide: true,
  });
  child.unref();
  fs.writeFileSync(PID_FILE, String(child.pid));

  for (let i = 0; i < 50; i++) {
    if (await ping()) {
      console.log(`Serving in the background (pid ${child.pid}). Stop with \`npm run host:stop\`.`);
      printUrls();
      console.log(`Log: ${LOG_FILE}`);
      return;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  console.error(`Server did not answer on port ${PORT}. See ${LOG_FILE}`);
  process.exit(1);
}

async function stop() {
  const pid = readPid();
  if (pid && alive(pid)) {
    process.kill(pid);
    console.log(`Stopped server (pid ${pid}).`);
  } else if (await ping()) {
    console.log(`Port ${PORT} is served by something this script did not start. Leaving it alone.`);
  } else {
    console.log('Not running.');
  }
  try {
    fs.unlinkSync(PID_FILE);
  } catch {
    /* already gone */
  }
}

async function status() {
  if (await ping()) {
    const pid = readPid();
    console.log(`Running on port ${PORT}${pid && alive(pid) ? ` (pid ${pid})` : ''}.`);
    printUrls();
  } else {
    console.log('Not running.');
  }
}

const cmd = process.argv[2] || 'start';
const fn = { start, stop, status }[cmd];
if (!fn) {
  console.error('Usage: node scripts/host.cjs start|stop|status');
  process.exit(1);
}
fn();
