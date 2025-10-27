import { Page } from '@playwright/test';
import { Debug } from '@eventuras/logger';

import { getEventFromApi } from '../playwright-e2e/functions';
import { generateTestEventData, TestEventData } from './testEventData';

const debug = Debug.create('e2e:event-creation');

export type EventCreationOptions = {
  /** Custom event data (overrides generated data) */
  customData?: Partial<TestEventData>;
  /** Wait for explicit save confirmation (default: true) */
  waitForSave?: boolean;
};

/**
 * Create a test event with rich content for E2E testing.
 *
 * This function creates an event with realistic markdown content including:
 * - Headings, lists, and formatted text
 * - Program schedule with multiple days
 * - Practical information with transport and accommodation
 * - More detailed information sections
 *
 * @param page - Playwright page object
 * @param eventName - Base name for the event
 * @param options - Configuration options
 * @returns The created event ID
 */
export const createTestEvent = async (
  page: Page,
  eventName: string,
  options: EventCreationOptions = {}
): Promise<string> => {
  const { customData = {}, waitForSave = true } = options;

  debug('Creating test event: %s (rich content: ALWAYS)', eventName);

  // Generate event data with rich content
  const baseData = generateTestEventData(eventName);
  const eventData = { ...baseData, ...customData };

  debug('Navigating to admin panel...');
  await page.goto('/admin');
  await page.waitForLoadState('load');

  // Create event with only title before being forwarded to the edit page
  debug('Creating event with title: %s', eventData.title);
  await page.locator('[data-testid="add-event-button"]').click();
  await page.locator('[data-testid="event-title-input"]').click();
  await page.locator('[data-testid="event-title-input"]').fill(eventData.title);
  await page.locator('[data-testid="create-event-submit-button"]').click();
  await page.waitForURL('**/admin/events/**');

  // Fill in overview details
  debug('Filling overview tab...');
  await page.locator('[data-testid="tab-overview"]').click();
  await page.locator('[data-testid="eventeditor-status-select-button"]').click();
  await page.getByRole('option', { name: 'RegistrationsOpen' }).click();
  await page.locator('[name="headline"]').fill(eventData.headline);
  await page.locator('[name="category"]').fill(eventData.category);
  await page.locator('[name="maxParticipants"]').fill(eventData.maxParticipants.toString());
  await page.locator('[name="featuredImageUrl"]').fill(eventData.featuredImageUrl);
  await page.locator('[name="featuredImageCaption"]').fill(eventData.featuredImageCaption);

  // Fill in dates and location
  debug('Filling dates and location tab...');
  await page.locator('[data-testid="tab-dates"]').click();

  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const lastRegistrationDate = new Date(Date.now() + oneWeek * 2);
  const lastCancellationDate = new Date(Date.now() + oneWeek * 3);
  const startDate = new Date(Date.now() + oneWeek * 4);
  const endDate = new Date(Date.now() + oneWeek * 5);

  const formatDate = (d: Date) => {
    const pad = (s: string) => (s.length === 1 ? `0${s}` : s);
    const year = d.getFullYear();
    const month = pad((d.getMonth() + 1).toString());
    const day = pad(d.getDate().toString());
    return `${year}-${month}-${day}`;
  };

  await page.locator('[name="dateStart"]').fill(formatDate(startDate));
  await page.locator('[name="dateEnd"]').fill(formatDate(endDate));
  await page.locator('[name="lastRegistrationDate"]').fill(formatDate(lastRegistrationDate));
  await page.locator('[name="lastCancellationDate"]').fill(formatDate(lastCancellationDate));
  await page.locator('[name="city"]').fill(eventData.city);
  await page.locator('[name="location"]').fill(eventData.location);

  // Fill in descriptions with rich markdown content
  debug('Filling descriptions tab with rich markdown content...');
  await page.locator('[data-testid="tab-descriptions"]').click();

  // Note: Lexical editors need special handling for markdown.
  // Using .fill() just puts plain text, so markdown syntax like ** won't be parsed.
  // For now, we'll use .fill() which means the saved content will have markdown syntax
  // that should be properly rendered on the public pages by MarkdownContent component.

  // Use id selectors to find the editor wrapper, then get the textbox inside
  await page.locator('#eventeditor-description-editable').getByRole('textbox').fill(eventData.description);
  await page.locator('#eventeditor-program-editable').getByRole('textbox').fill(eventData.program);
  await page.locator('#eventeditor-practical-information-editable').getByRole('textbox').fill(eventData.practicalInformation);
  await page.locator('#eventeditor-more-information-editable').getByRole('textbox').fill(eventData.moreInformation);
  await page.locator('#eventeditor-welcome-letter-editable').getByRole('textbox').fill(eventData.welcomeLetter);
  await page.locator('#eventeditor-information-request-editable').getByRole('textbox').fill(eventData.informationRequest);

  // Fill certificate details
  debug('Filling certificate tab...');
  await page.locator('[data-testid="tab-certificate"]').click();
  await page.locator('[name="certificateTitle"]').fill(eventData.certificateTitle);
  await page.locator('[name="certificateDescription"]').fill(eventData.certificateDescription);

  // Navigate to advanced tab to get event ID
  debug('Navigating to advanced tab to get event ID...');
  await page.locator('[data-testid="tab-advanced"]').click();
  await page.waitForLoadState('networkidle');

  const eventId = await page.locator('[data-testid="eventeditor-form-eventid"]').inputValue();
  debug('Event ID: %s', eventId);

  if (waitForSave) {
    await saveEventAndValidate(page, eventId);
  } else {
    debug('Skipping save validation (waitForSave: false)');
    await page.waitForTimeout(3000); // Give auto-save time
  }

  debug('✅ Event created successfully: %s', eventId);
  return eventId;
};

/**
 * Save the event and validate that it was properly saved to the backend.
 */
async function saveEventAndValidate(page: Page, eventId: string): Promise<void> {
  debug('Attempting to save event...');
  const saveButton = page.locator('[data-testid="event-save-button"]');

  try {
    await saveButton.waitFor({ state: 'visible', timeout: 3000 });
    debug('Save button found, clicking...');
    await saveButton.click();

    // Wait for save confirmation toast
    const toastAppeared = await page
      .locator('text=Changes saved')
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (toastAppeared) {
      debug('✅ Save confirmed via toast');
      await page.waitForTimeout(1000);
    } else {
      debug('⚠️  No toast appeared, waiting longer for save...');
      await page.waitForTimeout(3000);
    }
  } catch {
    debug('⚠️  Save button not found, waiting for auto-save...');
    await page.waitForTimeout(5000);
  }

  await page.waitForLoadState('networkidle');

  // Validate event was saved by fetching from API
  debug('Fetching event from API to validate submission...');
  const jsonResponse = await getEventFromApi(eventId);

  debug('Full API response: %O', jsonResponse);

  if (jsonResponse.status === 'Draft') {
    debug('⚠️  WARNING: Event is still in Draft status - fields may not have been saved!');
  }

  // Verify that data was actually saved
  const hasData =
    jsonResponse.description || jsonResponse.city || (jsonResponse.maxParticipants ?? 0) > 0;

  if (!hasData) {
    debug('❌ CRITICAL: Event fields were NOT saved! All fields are NULL.');
    debug('This will cause the public event page to fail.');
    throw new Error('Event data not saved - cannot proceed with test');
  }

  debug('✅ Event data verified as saved');
}
