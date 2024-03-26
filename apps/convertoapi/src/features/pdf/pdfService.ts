import { chromium, Page, Browser } from 'playwright';

const generatePdf = async (pageInit: (page: Page) => Promise<void>, format: string, scale: number): Promise<Buffer> => {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        process.env.PLAYWRIGHT_NOSANDBOX === 'true' ? '--no-sandbox' : '',
        process.env.PLAYWRIGHT_DISABLE_SETUID_SANDBOX === 'true' ? '--disable-setuid-sandbox' : '',
      ].filter(Boolean),
    });
    const page = await browser.newPage();
    await pageInit(page);
    const pdfBuffer = await page.pdf({ format, scale });
    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const HTMLToPDFService = {
  url2pdf: async (url: string, scale = 1, format = 'A4') => generatePdf(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle' });
  }, format, scale),

  html2pdf: async (html: string, scale = 1, format = 'A4') => generatePdf(async (page) => {
    await page.setContent(html, { waitUntil: 'networkidle' });
  }, format, scale),
};
