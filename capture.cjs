const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///' + path.join(__dirname, 'dist', 'index.html').replace(/\\/g, '/');
const ICON_SVG_URL = 'file:///' + path.join(__dirname, 'icon.svg').replace(/\\/g, '/');
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
    defaultViewport: { width: 1600, height: 940, deviceScaleFactor: 2 }
  });

  try {
    const page = await browser.newPage();

    // 0. Render 512x512 icon.png from icon.svg
    await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 2 });
    await page.goto(ICON_SVG_URL, { waitUntil: 'load' });
    const iconRoot = path.join(__dirname, 'icon.png');
    const iconPublic = path.join(__dirname, 'public', 'icon.png');
    await page.screenshot({ path: iconRoot, omitBackground: false });
    fs.copyFileSync(iconRoot, iconPublic);
    console.log('Generated icon.png and public/icon.png');

    // Reset viewport to desktop full width
    await page.setViewport({ width: 1600, height: 940, deviceScaleFactor: 2 });
    console.log('Navigating to', URL);
    await page.goto(URL, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 800));

    // Clear previous storage to ensure clean projects
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 800));

    // 1. OLED Dark Board (edge to edge full width)
    const boardPath = path.join(OUT_DIR, 'banker-oled-dark.png');
    const boardArtifact = path.join(ARTIFACT_DIR, 'banker-oled-dark.png');
    await page.screenshot({ path: boardPath });
    fs.copyFileSync(boardPath, boardArtifact);
    console.log('Captured banker-oled-dark.png');

    // 2. Open Project Drawer in OLED Dark
    const card = await page.$('.oled-card');
    if (card) {
      await card.click();
      await new Promise(r => setTimeout(r, 500));
      const drawerPath = path.join(OUT_DIR, 'banker-drawer.png');
      const drawerArtifact = path.join(ARTIFACT_DIR, 'banker-drawer.png');
      await page.screenshot({ path: drawerPath });
      fs.copyFileSync(drawerPath, drawerArtifact);
      console.log('Captured banker-drawer.png');

      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    }

    // 3. Switch to Table view in OLED Dark (hotkey '2')
    await page.keyboard.press('2');
    await new Promise(r => setTimeout(r, 500));
    const tablePath = path.join(OUT_DIR, 'banker-table.png');
    const tableArtifact = path.join(ARTIFACT_DIR, 'banker-table.png');
    await page.screenshot({ path: tablePath });
    fs.copyFileSync(tablePath, tableArtifact);
    console.log('Captured banker-table.png');

    // 4. Switch to Light Mode (hotkey 'T')
    await page.keyboard.press('t');
    await page.keyboard.press('1'); // back to board
    await new Promise(r => setTimeout(r, 500));
    const lightPath = path.join(OUT_DIR, 'banker-light-mode.png');
    const lightArtifact = path.join(ARTIFACT_DIR, 'banker-light-mode.png');
    await page.screenshot({ path: lightPath });
    fs.copyFileSync(lightPath, lightArtifact);
    console.log('Captured banker-light-mode.png');

    // 5. Mobile View (iPhone 15 format, dark mode)
    await page.keyboard.press('t'); // back to dark
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
