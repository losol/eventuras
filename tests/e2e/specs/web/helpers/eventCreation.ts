import { Logger } from '@eventuras/logger';
import { Page } from '@playwright/test';

import { getEventFromApi } from './event';
import { generateTestEventData, TestEventData } from '../../shared/testEventData';

const logger = Logger.create({ namespace: 'e2e:event-creation' });

/**
 * Fill a Lexical rich text editor by simulating a clipboard paste event.
 *
 * Playwright's `.fill()` uses `insertText` which doesn't dispatch `beforeinput`
 * events. Lexical relies on `beforeinput` for all content mutations, so `.fill()`
 * silently fails — the DOM text appears but Lexical's internal state (and thus
 * React Hook Form via Controller's `field.onChange`) never updates.
 *
 * Clipboard paste events ARE handled natively by Lexical's clipboard module.
 */
async function fillLexicalEditor(page: Page, editorId: string, text: string): Promise<void> {
  logger.debug({ editorId }, 'Filling Lexical editor via paste');
  const editor = page.locator(`#${editorId}`).getByRole('textbox');
  await editor.click();

  // Dispatch a synthetic paste event — Lexical reads clipboardData.getData('text/plain')
  await editor.evaluate((el, content) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', content);
    el.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      })
    );
  }, text);

  // Allow Lexical to process paste → OnChangePlugin → field.onChange → RHF state
  await page.waitForTimeout(300);
}

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

  logger.debug({ eventName }, 'Creating test event');

  // Generate event data with rich content
  const baseData = generateTestEventData(eventName);
  const eventData = { ...baseData, ...customData };

  logger.debug('Navigating to admin panel...');
  await page.goto('/admin');
  await page.waitForLoadState('load');

  // Create event with only title before being forwarded to the edit page
  logger.debug({ title: eventData.title }, 'Creating event with title');
  await page.locator('[data-testid="add-event-button"]').click();
  await page.locator('[data-testid="event-title-input"]').click();
  await page.locator('[data-testid="event-title-input"]').fill(eventData.title);
  await page.locator('[data-testid="create-event-submit-button"]').click();
  await page.waitForURL('**/admin/events/**');

  // Wait for the page to be fully loaded and interactive
  logger.debug('Waiting for page to load after navigation...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    logger.debug('Network not idle, continuing anyway...');
  });

  // Fill in overview details
  logger.debug('Filling overview tab...');
  await page.locator('[data-testid="tab-overview"]').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('[data-testid="tab-overview"]').click();
  await page.locator('[data-testid="eventeditor-status-select-button"]').click();
  await page.getByRole('option', { name: 'RegistrationsOpen' }).click();
  await page.locator('[name="headline"]').fill(eventData.headline ?? '');
  await page.locator('[name="category"]').fill(eventData.category ?? '');
  await page.locator('[name="maxParticipants"]').fill(eventData.maxParticipants?.toString() ?? '');
  await page.locator('[name="featuredImageUrl"]').fill(eventData.featuredImageUrl ?? '');
  await page.locator('[name="featuredImageCaption"]').fill(eventData.featuredImageCaption ?? '');

  // Fill in dates and location
  logger.debug('Filling dates and location tab...');
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
  await page.locator('[name="city"]').fill(eventData.city ?? '');
  await page.locator('[name="location"]').fill(eventData.location ?? '');

  // Fill in descriptions using paste events for Lexical editors
  logger.debug('Filling descriptions tab...');
  await page.locator('[data-testid="tab-descriptions"]').click();
  // Wait for the description editors to be visible
  await page.locator('#eventeditor-description-editable').waitFor({ state: 'visible' });

  await fillLexicalEditor(page, 'eventeditor-description-editable', eventData.description ?? '');
  await fillLexicalEditor(page, 'eventeditor-program-editable', eventData.program ?? '');
  await fillLexicalEditor(
    page,
    'eventeditor-practical-information-editable',
    eventData.practicalInformation ?? ''
  );
  await fillLexicalEditor(
    page,
    'eventeditor-more-information-editable',
    eventData.moreInformation ?? ''
  );
  await fillLexicalEditor(
    page,
    'eventeditor-welcome-letter-editable',
    eventData.welcomeLetter ?? ''
  );
  await fillLexicalEditor(
    page,
    'eventeditor-information-request-editable',
    eventData.informationRequest ?? ''
  );

  // Fill certificate details
  logger.debug('Filling certificate tab...');
  await page.locator('[data-testid="tab-certificate"]').click();
  await page.locator('[name="certificateTitle"]').fill(eventData.certificateTitle ?? '');
  await page
    .locator('[name="certificateDescription"]')
    .fill(eventData.certificateDescription ?? '');

  // Navigate to advanced tab to get event ID
  logger.debug('Navigating to advanced tab to get event ID...');
  await page.locator('[data-testid="tab-advanced"]').click();
  await page.waitForLoadState('networkidle');

  const eventId = await page.locator('[data-testid="eventeditor-form-eventid"]').inputValue();
  logger.debug({ eventId }, 'Event ID');

  if (waitForSave) {
    await saveEventAndValidate(page, eventId);
  } else {
    logger.debug('Skipping save validation (waitForSave: false)');
    await page.waitForTimeout(3000); // Give auto-save time
  }

  logger.debug({ eventId }, 'Event created successfully');
  return eventId;
};

/**
 * Save the event and validate that it was properly saved to the backend.
 *
 * The form uses auto-save with a 1-second debounce, so data may already be saved
 * by the time we get here. We wait for pending auto-saves to settle, then click
 * save as a safety net, and verify via API.
 */
async function saveEventAndValidate(page: Page, eventId: string): Promise<void> {
  logger.debug('Waiting for pending auto-saves to settle...');

  // Let auto-save debounce (1s) + API call finish before clicking save manually.
  // This avoids concurrent PUT requests which can cause API errors.
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
    logger.debug('Network not idle after 5s, continuing...');
  });

  const saveButton = page.locator('[data-testid="event-save-button"]');
  await saveButton.waitFor({ state: 'visible', timeout: 5000 });

  // Wait for any stale toasts from auto-save to disappear before clicking save,
  // so we can reliably detect the toast from our explicit save click.
  const staleToast = page.getByText('Changes saved');
  await staleToast.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
    logger.debug('Stale toast still visible, continuing...');
  });

  // Try saving up to 2 times — auto-save race conditions can cause transient failures
  for (let attempt = 1; attempt <= 2; attempt++) {
    logger.debug({ attempt }, 'Save attempt...');
    await saveButton.click();

    // Wait for either success or error toast.
    // Stale "Changes saved" toasts were cleared above, so any new one is from this click.
    const successToast = page.getByText('Changes saved');
    const errorToast = page.getByText('Save failed', { exact: false });

    const result = await Promise.race([
      successToast
        .waitFor({ state: 'visible', timeout: 8000 })
        .then(() => 'success' as const),
      errorToast
        .waitFor({ state: 'visible', timeout: 8000 })
        .then(() => 'error' as const),
    ]).catch(() => 'timeout' as const);

    if (result === 'success') {
      logger.debug('Save confirmed via toast');
      break;
    } else if (result === 'error') {
      const errorMsg = await errorToast.last().textContent();
      logger.debug({ attempt, errorMsg }, 'Save failed');
      if (attempt < 2) {
        logger.debug('Retrying after a brief wait...');
        await page.waitForTimeout(2000);
      }
    } else {
      logger.debug({ attempt }, 'No toast seen — auto-save may have already persisted');
      break;
    }
  }

  // Give the API time to finish
  await page.waitForTimeout(1000);

  // Validate event was saved by fetching from API
  logger.debug('Fetching event from API to validate...');
  const jsonResponse = await getEventFromApi(eventId);

  logger.debug({
    status: jsonResponse.status,
    city: jsonResponse.city,
    maxParticipants: jsonResponse.maxParticipants,
    descriptionLength: jsonResponse.description?.length ?? 0,
  }, 'API response');

  // Verify that data was actually saved
  const hasData =
    jsonResponse.description || jsonResponse.city || (jsonResponse.maxParticipants ?? 0) > 0;

  if (!hasData) {
    logger.debug('CRITICAL: Event fields were NOT saved! All fields are NULL.');
    throw new Error(
      'Event data not saved — description, city, and maxParticipants are all NULL. ' +
        'This likely means Lexical editor paste events or form field changes are not ' +
        'reaching React Hook Form state.'
    );
  }

  logger.debug('Event data verified as saved');
}
