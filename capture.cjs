const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///' + path.join(__dirname, 'dist', 'index.html').replace(/\\/g, '/');
const ICON_SVG_URL = 'file:///' + path.join(__dirname, 'icon.svg').replace(/\\/g, '/');
const OUT_DIR = path.join(__dirname, 'screenshots');
const ARTIFACT_DIR = process.env.ARTIFACT_DIR;

function copyToArtifact(srcPath, filename) {
  if (ARTIFACT_DIR && fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(srcPath, path.join(ARTIFACT_DIR, filename));
  }
}

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
    await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
    await page.goto(ICON_SVG_URL, { waitUntil: 'load' });
    const iconRoot = path.join(__dirname, 'icon.png');
    const iconPublic = path.join(__dirname, 'public', 'icon.png');
    await (await page.$('svg')).screenshot({ path: iconRoot, omitBackground: true });
    fs.copyFileSync(iconRoot, iconPublic);
    console.log('Generated icon.png and public/icon.png');

    // Reset viewport to desktop full width
    await page.setViewport({ width: 1600, height: 940, deviceScaleFactor: 2 });
    console.log('Navigating to', URL);
    await page.goto(URL, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 1000));

    // Clear previous storage to ensure clean projects
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 1000));

    // 1. OLED Dark Board (edge to edge full width in Slopalytics aesthetic)
    const boardPath = path.join(OUT_DIR, 'banker-oled-dark.png');
    await page.screenshot({ path: boardPath });
    copyToArtifact(boardPath, 'banker-oled-dark.png');
    console.log('Captured banker-oled-dark.png');

    // 2. Open Project Drawer in OLED Dark
    const card = await page.$('.slop-card');
    if (card) {
      await card.click();
      await new Promise(r => setTimeout(r, 600));
      const drawerPath = path.join(OUT_DIR, 'banker-drawer.png');
      await page.screenshot({ path: drawerPath });
      copyToArtifact(drawerPath, 'banker-drawer.png');
      console.log('Captured banker-drawer.png');

      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }

    // 3. Switch to Table view (hotkey '2')
    await page.keyboard.press('2');
    await new Promise(r => setTimeout(r, 600));
    const tablePath = path.join(OUT_DIR, 'banker-table.png');
    await page.screenshot({ path: tablePath });
    copyToArtifact(tablePath, 'banker-table.png');
    console.log('Captured banker-table.png');

    // 4. Switch to Roadmap view (hotkey '3')
    await page.keyboard.press('3');
    await new Promise(r => setTimeout(r, 600));
    const roadmapPath = path.join(OUT_DIR, 'banker-roadmap.png');
    await page.screenshot({ path: roadmapPath });
    copyToArtifact(roadmapPath, 'banker-roadmap.png');
    console.log('Captured banker-roadmap.png');

    // 5. Switch to Analytics view (hotkey '4')
    await page.keyboard.press('4');
    await new Promise(r => setTimeout(r, 600));
    const analyticsPath = path.join(OUT_DIR, 'banker-analytics.png');
    await page.screenshot({ path: analyticsPath });
    copyToArtifact(analyticsPath, 'banker-analytics.png');
    console.log('Captured banker-analytics.png');

    // 5b. Usage view (hotkey '5'; sample data because file:// has no /usage.json)
    await page.keyboard.press('5');
    await new Promise(r => setTimeout(r, 800));
    const usagePath = path.join(OUT_DIR, 'banker-usage.png');
    await page.screenshot({ path: usagePath });
    copyToArtifact(usagePath, 'banker-usage.png');
    console.log('Captured banker-usage.png');

    // 6. Switch to Light Mode (hotkey 'T') on Board
    await page.keyboard.press('1'); // back to board
    await page.keyboard.press('t'); // toggle theme
    await new Promise(r => setTimeout(r, 600));
    const lightPath = path.join(OUT_DIR, 'banker-light-mode.png');
    await page.screenshot({ path: lightPath });
    copyToArtifact(lightPath, 'banker-light-mode.png');
    console.log('Captured banker-light-mode.png');

    // 7. Mobile View (iPhone 15 format, dark mode)
    await page.keyboard.press('t'); // back to dark
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 600));
    const mobileDarkPath = path.join(OUT_DIR, 'banker-mobile-dark.png');
    await page.screenshot({ path: mobileDarkPath });
    copyToArtifact(mobileDarkPath, 'banker-mobile-dark.png');
    fs.copyFileSync(mobileDarkPath, path.join(OUT_DIR, 'banker-mobile.png'));
    console.log('Captured banker-mobile-dark.png');

    // 8. Mobile usage page, then mobile light board
    const navButtons = await page.$$('.mobile-nav button');
    await navButtons[3].click();
    await new Promise(r => setTimeout(r, 800));
    const mobileUsagePath = path.join(OUT_DIR, 'banker-mobile-usage.png');
    await page.screenshot({ path: mobileUsagePath });
    console.log('Captured banker-mobile-usage.png');

    await navButtons[0].click();
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 600));
    const mobileLightPath = path.join(OUT_DIR, 'banker-mobile-light.png');
    await page.screenshot({ path: mobileLightPath });
    console.log('Captured banker-mobile-light.png');

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
