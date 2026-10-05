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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 }
  });

  try {
    const page = await browser.newPage();
    console.log('Navigating to', URL);
    await page.goto(URL, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 800));

    // 1. OLED Dark Board
    const boardPath = path.join(OUT_DIR, 'banker-oled-dark.png');
    const boardArtifact = path.join(ARTIFACT_DIR, 'banker-oled-dark.png');
    await page.screenshot({ path: boardPath });
    fs.copyFileSync(boardPath, boardArtifact);
    console.log('Captured banker-oled-dark.png');

    // 2. Open Aether Drawer in OLED Dark
    const aetherCard = await page.$('.oled-card');
    if (aetherCard) {
      await aetherCard.click();
      await new Promise(r => setTimeout(r, 500));
      const drawerPath = path.join(OUT_DIR, 'banker-drawer.png');
      const drawerArtifact = path.join(ARTIFACT_DIR, 'banker-drawer.png');
      await page.screenshot({ path: drawerPath });
      fs.copyFileSync(drawerPath, drawerArtifact);
      console.log('Captured banker-drawer.png');

      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    }

    // 3. Switch to Light Mode (hotkey 'T')
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 500));
    const lightPath = path.join(OUT_DIR, 'banker-light-mode.png');
    const lightArtifact = path.join(ARTIFACT_DIR, 'banker-light-mode.png');
    await page.screenshot({ path: lightPath });
    fs.copyFileSync(lightPath, lightArtifact);
    console.log('Captured banker-light-mode.png');

    // 4. Switch to Table view in Light Mode (hotkey '2')
    await page.keyboard.press('2');
    await new Promise(r => setTimeout(r, 400));
    const tablePath = path.join(OUT_DIR, 'banker-table.png');
    const tableArtifact = path.join(ARTIFACT_DIR, 'banker-table.png');
    await page.screenshot({ path: tablePath });
    fs.copyFileSync(tablePath, tableArtifact);
    console.log('Captured banker-table.png');

    // 5. Mobile View (iPhone 15 format, dark mode)
    await page.keyboard.press('t'); // back to dark
    await page.keyboard.press('1'); // back to board
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 500));
    const mobilePath = path.join(OUT_DIR, 'banker-mobile.png');
    const mobileArtifact = path.join(ARTIFACT_DIR, 'banker-mobile.png');
    await page.screenshot({ path: mobilePath });
    fs.copyFileSync(mobilePath, mobileArtifact);
    console.log('Captured banker-mobile.png');

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    console.log('Capture complete!');
  }
}

capture();
