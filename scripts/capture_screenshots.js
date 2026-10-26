const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'images');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Capture Login Page (Figure A.1)
  console.log('Capturing Figure A.1: Login Page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_A1_Login_Page.png') });

  // Authenticate as Admin
  console.log('Logging in as Admin via API...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@smarterp.com', password: 'password123', expectedRole: 'admin' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    throw new Error('Failed to login via API: ' + JSON.stringify(loginData));
  }

  const { token, user } = loginData.data;

  // Navigate to an app page and set localStorage
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('lastPortal', 'admin');
  }, { token, user });

  // 2. Capture Executive Dashboard (Figure A.2)
  console.log('Capturing Figure A.2: Executive Dashboard...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_A2_Executive_Dashboard.png') });

  // 3. Capture Inventory Product List (Figure A.3)
  console.log('Capturing Figure A.3: Inventory Product List...');
  await page.goto('http://localhost:5173/inventory', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_A3_Inventory_Products.png') });

  // 4. Capture Sales Orders (Figure A.4)
  console.log('Capturing Figure A.4: Sales Order and Order Confirmation...');
  await page.goto('http://localhost:5173/sales', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_A4_Sales_Order.png') });

  // 5. Capture Purchase Orders (Figure A.5)
  console.log('Capturing Figure A.5: Purchase Order and Receive Stock...');
  await page.goto('http://localhost:5173/purchases', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_A5_Purchase_Order.png') });

  // 6. Capture Reports and CSV Export (Figure A.6)
  console.log('Capturing Figure A.6: Reports and CSV Export...');
  await page.goto('http://localhost:5173/reports', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_A6_Reports.png') });

  // 7. Capture Employee Directory (Figure A.7)
  console.log('Capturing Figure A.7: Employee Directory (HR Module)...');
  await page.goto('http://localhost:5173/hr', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_A7_Employee_Directory.png') });

  // 8. Capture Users and Roles Management (Figure A.8)
  console.log('Capturing Figure A.8: Users and Roles Management...');
  await page.goto('http://localhost:5173/hr/users', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_A8_Users_Management.png') });

  console.log('All 8 project screenshots captured successfully with live verified routes!');
  await browser.close();
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
