import { EventDto } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import fs, { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const logger = Logger.create({ namespace: 'e2e:event' });
const STATE_DIR = 'tmp/state';
const CREATED_EVENT_PATH = join(STATE_DIR, 'createdEvent.json');

// Get backend API URL from environment (required)
const BACKEND_API_URL = process.env.E2E_API_URL;
if (!BACKEND_API_URL) {
  throw new Error('E2E_API_URL environment variable is required');
}

/**
 * Fetch event details directly from the backend API
 */
export const getEventFromApi = async (eventId: string): Promise<EventDto> => {
  logger.debug({ eventId, apiUrl: BACKEND_API_URL }, 'Fetching event from API');
  const response = await fetch(`${BACKEND_API_URL}/v3/events/${eventId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch event ${eventId}: ${response.status} ${response.statusText}`);
  }

  const event = (await response.json()) as EventDto;
  logger.debug({ title: event.title }, 'Successfully fetched event');
  return event;
};

type CreatedEvent = {
  eventId: string;
};

export const readCreatedEvent = (): CreatedEvent => {
  try {
    return JSON.parse(fs.readFileSync(CREATED_EVENT_PATH, 'utf8'));
  } catch {
    throw new Error(
      `Cannot read ${CREATED_EVENT_PATH}. ` +
        'Run the admin event creation test first (001-admin-event-create-registration).'
    );
  }
};

export const writeCreatedEvent = (eventId: string) => {
  mkdirSync(STATE_DIR, { recursive: true });
  const eventToStore = JSON.stringify({ eventId });
  fs.writeFileSync(CREATED_EVENT_PATH, eventToStore);
};

export const addProductToEvent = async (page: Page, eventId: string) => {
  // Navigate to the event page if not already there
  logger.debug('Navigating to event page for adding products...');
  await page.goto(`/admin/events/${eventId}?tab=products`);
  await page.waitForLoadState('load');

  // Click add product button
  logger.debug('Clicking add product button...');
  await page.locator('[data-testid="add-product-button"]').click();

  // Wait for modal to open
  await page.waitForSelector('[data-testid="product-name-input"]', { state: 'visible' });

  logger.debug('Filling product form...');
  await page.locator('[data-testid="product-name-input"]').fill(`testname product for ${eventId}`);
  await page
    .locator('[data-testid="product-description-input"]')
    .fill(`test description - this is a description for product for ${eventId}`);
  await page.locator('[data-testid="product-price-input"]').fill('10');
  await page.locator('[data-testid="product-vat-input"]').fill('10');

  // Submit, then wait for either success (modal closes) or an error toast.
  // The modal only closes when createProduct succeeds, so a bare "input never
  // hidden" timeout hides the real cause — surface the error toast instead.
  logger.debug('Submitting product...');
  await page.locator('[type="submit"]').click();

  const nameInput = page.locator('[data-testid="product-name-input"]');
  const errorToast = page.locator('[data-testid="toast-error"]');
  const outcome = await Promise.race([
    nameInput.waitFor({ state: 'hidden', timeout: 10000 }).then(
      () => 'closed' as const,
      () => null
    ),
    errorToast.waitFor({ state: 'visible', timeout: 10000 }).then(
      () => 'error' as const,
      () => null
    ),
  ]);

  if (outcome === 'error') {
    const message = (await errorToast.innerText()).trim();
    throw new Error(
      `Product creation failed — error toast: "${message}". ` +
        'The create request was rejected by the API. Check the web server log line ' +
        '"Failed to create product" (logs response.error) or open the trace: ' +
        'pnpm exec playwright show-trace <result-dir>/trace.zip'
    );
  }
  if (outcome !== 'closed') {
    throw new Error(
      'Product form neither closed nor showed an error toast within 10s after submit — ' +
        'the form may not have submitted. Verify the [type="submit"] button and form wiring.'
    );
  }

  // Wait for the product to appear in the table
  logger.debug('Waiting for product to appear in table...');
  await expect(page.locator('[data-testid="edit-product-button"]')).toBeVisible({ timeout: 10000 });
  logger.debug('Product added successfully');
};
