const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://rvyyv-n.github.io/aether-bank/';
const OUT_DIR = path.join(__dirname, 'screenshots');
const ARTIFACT_DIR = 'C:\\Users\\rayyan\\.gemini\\antigravity-acp\\brain\\9e5afd4d-5d36-4b2d-8455-c190b3f6c150';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 }
  });

  try {
    const page = await browser.newPage();
    console.log('Navigating to', URL);
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    // 1. Kanban Board (Desktop)
    const boardPath = path.join(OUT_DIR, 'kanban-board.png');
    const boardArtifact = path.join(ARTIFACT_DIR, 'kanban-board.png');
    await page.screenshot({ path: boardPath });
    fs.copyFileSync(boardPath, boardArtifact);
    console.log('Captured kanban-board.png');

    // 2. Open Aether drawer
    const aetherCard = await page.$('.mica-card');
    if (aetherCard) {
      await aetherCard.click();
      await new Promise(r => setTimeout(r, 600));
      const drawerPath = path.join(OUT_DIR, 'project-drawer.png');
      const drawerArtifact = path.join(ARTIFACT_DIR, 'project-drawer.png');
      await page.screenshot({ path: drawerPath });
      fs.copyFileSync(drawerPath, drawerArtifact);
      console.log('Captured project-drawer.png');

      // Close drawer (ESC)
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }

    // 3. Switch to Table view
    await page.keyboard.press('2');
    await new Promise(r => setTimeout(r, 500));
    const tablePath = path.join(OUT_DIR, 'table-view.png');
    const tableArtifact = path.join(ARTIFACT_DIR, 'table-view.png');
    await page.screenshot({ path: tablePath });
    fs.copyFileSync(tablePath, tableArtifact);
    console.log('Captured table-view.png');

    // 4. Switch to Roadmap view
    await page.keyboard.press('3');
    await new Promise(r => setTimeout(r, 500));
    const roadmapPath = path.join(OUT_DIR, 'roadmap-view.png');
    const roadmapArtifact = path.join(ARTIFACT_DIR, 'roadmap-view.png');
    await page.screenshot({ path: roadmapPath });
    fs.copyFileSync(roadmapPath, roadmapArtifact);
    console.log('Captured roadmap-view.png');

    // 5. Mobile view (iPhone / mobile outside)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.keyboard.press('1'); // back to board
    await new Promise(r => setTimeout(r, 500));
    const mobilePath = path.join(OUT_DIR, 'mobile-view.png');
    const mobileArtifact = path.join(ARTIFACT_DIR, 'mobile-view.png');
    await page.screenshot({ path: mobilePath });
    fs.copyFileSync(mobilePath, mobileArtifact);
    console.log('Captured mobile-view.png');

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    console.log('Capture complete!');
  }
}

capture();
