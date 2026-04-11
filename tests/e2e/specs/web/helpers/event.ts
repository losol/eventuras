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

  // Click submit and wait for the modal to close and product to be created
  logger.debug('Submitting product...');
  await Promise.all([
    page.waitForSelector('[data-testid="product-name-input"]', { state: 'hidden', timeout: 10000 }),
    page.locator('[type="submit"]').click(),
  ]);

  // Wait for the product to appear in the table
  logger.debug('Waiting for product to appear in table...');
  await expect(page.locator('[data-testid="edit-product-button"]')).toBeVisible({ timeout: 10000 });
  logger.debug('Product added successfully');
};
