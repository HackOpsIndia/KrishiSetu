const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pagesToCapture = [
  { name: '01_landing.png', url: 'https://krishisetu-demo.vercel.app/' },
  { name: '02_farmer_dashboard.png', url: 'https://krishisetu-demo.vercel.app/dashboard' },
  { name: '03_markets_decision.png', url: 'https://krishisetu-demo.vercel.app/markets' },
  { name: '04_farmer_lots.png', url: 'https://krishisetu-demo.vercel.app/lots' },
  { name: '05_fpo_pooling.png', url: 'https://krishisetu-demo.vercel.app/fpo' },
  { name: '06_buyer_dashboard.png', url: 'https://krishisetu-demo.vercel.app/buyer/dashboard' },
  { name: '07_buyer_demand.png', url: 'https://krishisetu-demo.vercel.app/buyer/demand' },
  { name: '08_buyer_offers.png', url: 'https://krishisetu-demo.vercel.app/buyer/offers' },
  { name: '09_admin_dashboard.png', url: 'https://krishisetu-demo.vercel.app/admin/dashboard' },
  { name: '10_admin_users.png', url: 'https://krishisetu-demo.vercel.app/admin/users' },
  { name: '11_user_profile.png', url: 'https://krishisetu-demo.vercel.app/profile' },
];

async function capture() {
  console.log('Launching browser with executable:', EDGE_PATH);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920'],
    defaultViewport: { width: 1440, height: 920, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();

  // Set user role or logged in token in localStorage before each page
  for (const item of pagesToCapture) {
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Wait an extra 1.5s for charts and CSS animations to settle
      await new Promise((r) => setTimeout(r, 1800));

      const filePath = path.join(OUTPUT_DIR, item.name);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${item.name} (${fs.statSync(filePath).size} bytes)`);
    } catch (err) {
      console.error(`Failed to capture ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully in:', OUTPUT_DIR);
}

capture().catch(console.error);
