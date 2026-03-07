import { chromium, Page, Browser } from 'playwright';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser?.isConnected()) {
    return browser;
  }

  browser = await chromium.launch({
    headless: true,
    args: [
      process.env.PLAYWRIGHT_NOSANDBOX === 'true' ? '--no-sandbox' : '',
      process.env.PLAYWRIGHT_DISABLE_SETUID_SANDBOX === 'true' ? '--disable-setuid-sandbox' : '',
    ].filter(Boolean),
  });

  return browser;
}

const generatePdf = async (
  pageInit: (page: Page) => Promise<void>,
  format: string,
  scale: number
): Promise<Buffer> => {
  const instance = await getBrowser();
  const context = await instance.newContext();
  try {
    const page = await context.newPage();
    await pageInit(page);
    const pdfBuffer = await page.pdf({ format, scale });
    return pdfBuffer;
  } finally {
    await context.close();
  }
};

export async function closeBrowser(): Promise<void> {
  if (browser?.isConnected()) {
    await browser.close();
  }
  browser = null;
}

export const HTMLToPDFService = {
  url2pdf: async (url: string, scale = 1, format = 'A4') =>
    generatePdf(
      async page => {
        await page.goto(url, { waitUntil: 'networkidle' });
      },
      format,
      scale
    ),

  html2pdf: async (html: string, scale = 1, format = 'A4') =>
    generatePdf(
      async page => {
        await page.setContent(html, { waitUntil: 'networkidle' });
      },
      format,
      scale
    ),
};
