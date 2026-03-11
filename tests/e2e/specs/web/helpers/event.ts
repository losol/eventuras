import { EventDto } from '@eventuras/event-sdk';
import { Debug } from '@eventuras/logger';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const debug = Debug.create('e2e:event');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CREATED_EVENT_PATH = join(__dirname, 'createdEvent.json');

// Get backend API URL from environment (required)
const BACKEND_API_URL = process.env.E2E_API_URL;
if (!BACKEND_API_URL) {
  throw new Error('E2E_API_URL environment variable is required');
}

/**
 * Fetch event details directly from the backend API
 */
export const getEventFromApi = async (eventId: string): Promise<EventDto> => {
  debug('Fetching event %s from API: %s', eventId, BACKEND_API_URL);
  const response = await fetch(`${BACKEND_API_URL}/v3/events/${eventId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch event ${eventId}: ${response.status} ${response.statusText}`);
  }

  const event = (await response.json()) as EventDto;
  debug('Successfully fetched event: %s', event.title);
  return event;
};

type CreatedEvent = {
  eventId: string;
};

export const readCreatedEvent = (): CreatedEvent => {
  let createdEvent: CreatedEvent = { eventId: '-1' };
  try {
    createdEvent = JSON.parse(fs.readFileSync(CREATED_EVENT_PATH, 'utf8'));
  } catch (e: any) {
    debug('readCreatedEvent: cant read createdEvent.json');
  }
  return createdEvent;
};

export const writeCreatedEvent = (eventId: string) => {
  const eventToStore = JSON.stringify({ eventId });
  fs.writeFileSync(CREATED_EVENT_PATH, eventToStore);
};

export const addProductToEvent = async (page: Page, eventId: string) => {
  // Navigate to the event page if not already there
  debug('Navigating to event page for adding products...');
  await page.goto(`/admin/events/${eventId}?tab=products`);
  await page.waitForLoadState('load');

  // Click add product button
  debug('Clicking add product button...');
  await page.locator('[data-testid="add-product-button"]').click();

  // Wait for modal to open
  await page.waitForSelector('[data-testid="product-name-input"]', { state: 'visible' });

  debug('Filling product form...');
  await page.locator('[data-testid="product-name-input"]').fill(`testname product for ${eventId}`);
  await page
    .locator('[data-testid="product-description-input"]')
    .fill(`test description - this is a description for product for ${eventId}`);
  await page.locator('[data-testid="product-price-input"]').fill('10');
  await page.locator('[data-testid="product-vat-input"]').fill('10');

  // Click submit and wait for the modal to close and product to be created
  debug('Submitting product...');
  await Promise.all([
    page.waitForSelector('[data-testid="product-name-input"]', { state: 'hidden', timeout: 10000 }),
    page.locator('[type="submit"]').click(),
  ]);

  // Wait for the product to appear in the table
  debug('Waiting for product to appear in table...');
  await expect(page.locator('[data-testid="edit-product-button"]')).toBeVisible({ timeout: 10000 });
  debug('✅ Product added successfully');
};
