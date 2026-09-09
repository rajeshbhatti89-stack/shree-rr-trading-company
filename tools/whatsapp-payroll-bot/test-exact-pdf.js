const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testRender() {
  console.log('Launching Chrome to render exact Screenshot 1 PDF...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

  // Open the live slip page for Rahul Bhatti
  const url = 'https://shreerrtradingcompany.com/payroll/slip.html?id=slp-srr036-august-2026';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for slip content to be populated
  await page.waitForSelector('#printable-salary-slip-content', { visible: true, timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500)); // ensure fonts and images rendered

  // Hide top navigation bar
  await page.evaluate(() => {
    const hdr = document.querySelector('.slip-viewer-header');
    if (hdr) hdr.style.display = 'none';
    document.body.style.background = '#ffffff';
    const wrap = document.querySelector('.slip-container-wrap');
    if (wrap) {
      wrap.style.margin = '0';
      wrap.style.padding = '0';
      wrap.style.maxWidth = '100%';
    }
    const card = document.querySelector('.slip-card-render');
    if (card) {
      card.style.boxShadow = 'none';
      card.style.borderRadius = '0';
    }
  });

  const pdfBuf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();

  fs.writeFileSync('exact-slip-srr036.pdf', pdfBuf);
  console.log('SUCCESS_EXACT_PDF_GENERATED! Size:', pdfBuf.length, 'bytes');
}

testRender().catch(err => console.error('RENDER_ERROR:', err));
