/**
 * Test that validates markdown rendering and formatting on public event pages.
 *
 * This test creates an event via the API with rich markdown content and verifies that:
 * - Headings are rendered correctly
 * - Lists (ordered and unordered) display properly
 * - Text formatting (bold, italic) works
 * - Links and other elements are visible
 *
 * Content is set via API (not the Lexical editor) to ensure reliable test data,
 * since this test is about rendering, not the editor.
 */

import { expect, test } from '@playwright/test';
import { Debug } from '@eventuras/logger';

import { getEventFromApi, writeCreatedEvent } from '../helpers/event';
import { adminApi } from '../../shared/api-helpers';
import { generateTestEventData } from '../../shared/testEventData';

const debug = Debug.create('e2e:markdown-rendering');

test.describe.configure({ mode: 'serial' });
const eventName = `Markdown Test Event - ${Math.floor(Date.now() / 1000 / 10)}`;
let eventId: string;

test.use({ storageState: 'playwright-auth/admin.json' });

test.describe('markdown rendering on public event page', () => {
  test('create event with rich markdown content via API', async () => {
    const eventData = generateTestEventData(eventName);
    debug('Creating event via API: %s', eventData.title);

    // Create event via API
    const slug = `md-test-${Math.floor(Date.now() / 1000)}`;
    const created = await adminApi.post<{ id: number }>('/v3/events', {
      title: eventData.title,
      slug,
      headline: eventData.headline,
      category: eventData.category,
      description: eventData.description,
      program: eventData.program,
      practicalInformation: eventData.practicalInformation,
      moreInformation: eventData.moreInformation,
      status: 'RegistrationsOpen',
      maxParticipants: eventData.maxParticipants,
      city: eventData.city,
      location: eventData.location,
      organizationId: 1,
    });

    eventId = created.id.toString();
    writeCreatedEvent(eventId);
    debug('Event created via API: %s', eventId);

    // Verify content was saved
    const event = await getEventFromApi(eventId);
    expect(event.program).toBeTruthy();
    expect(event.practicalInformation).toBeTruthy();
    expect(event.moreInformation).toBeTruthy();
    debug('Content verified in API response');
  });

  test('verify program section renders markdown correctly', async ({ page }) => {
    debug('Navigating to public event page...');
    await page.goto(`/events/${eventId}`);
    await page.waitForLoadState('load');

    debug('Scrolling to program section...');
    await page.locator('#program').scrollIntoViewIfNeeded();

    // Verify headings are rendered (markdown uses ### which renders as h3)
    debug('Checking for h3 headings in program...');
    const programHeading = page.locator('#program h3').first();
    await expect(programHeading).toBeVisible();
    await expect(programHeading).toContainText('Day 1');

    // Verify lists are rendered with proper styling
    debug('Checking for lists in program...');
    const unorderedList = page.locator('#program ul').first();
    await expect(unorderedList).toBeVisible();

    const orderedList = page.locator('#program ol').first();
    await expect(orderedList).toBeVisible();

    // Verify bold text is rendered
    debug('Checking for bold text in program...');
    const boldText = page.locator('#program strong').first();
    await expect(boldText).toBeVisible();

    debug('Program section markdown rendered correctly');
  });

  test('verify practical information section renders markdown correctly', async ({ page }) => {
    debug('Navigating to public event page...');
    await page.goto(`/events/${eventId}`);
    await page.waitForLoadState('load');

    debug('Scrolling to practical information section...');
    await page.locator('#practical-information').scrollIntoViewIfNeeded();

    // Verify headings are rendered (markdown uses ### which renders as h3)
    debug('Checking for h3 headings in practical info...');
    const practicalHeading = page.locator('#practical-information h3').first();
    await expect(practicalHeading).toBeVisible();
    await expect(practicalHeading).toContainText('Getting There');

    // Verify nested headings (h4) are rendered
    debug('Checking for h4 headings...');
    const subHeading = page.locator('#practical-information h4').first();
    await expect(subHeading).toBeVisible();

    // Verify lists with icons/emojis are visible
    debug('Checking for lists in practical info...');
    const lists = page.locator('#practical-information ul');
    await expect(lists.first()).toBeVisible();

    debug('Practical information section markdown rendered correctly');
  });

  test('verify more information section renders markdown correctly', async ({ page }) => {
    debug('Navigating to public event page...');
    await page.goto(`/events/${eventId}`);
    await page.waitForLoadState('load');

    debug('Scrolling to more information section...');
    await page.locator('#more-information').scrollIntoViewIfNeeded();

    // Verify headings are rendered (markdown uses ### which renders as h3)
    debug('Checking for h3 headings in more info...');
    const moreInfoHeading = page.locator('#more-information h3').first();
    await expect(moreInfoHeading).toBeVisible();

    // Verify links are rendered and safe
    debug('Checking for links...');
    const links = page.locator('#more-information a');
    if ((await links.count()) > 0) {
      const firstLink = links.first();
      await expect(firstLink).toBeVisible();

      // Verify safe link attributes (should have target="_blank" and rel="noopener noreferrer")
      const target = await firstLink.getAttribute('target');
      const rel = await firstLink.getAttribute('rel');
      expect(target).toBe('_blank');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
      debug('Links have correct security attributes');
    }

    // Verify horizontal rules are rendered
    debug('Checking for horizontal rules...');
    const hrs = page.locator('#more-information hr');
    if ((await hrs.count()) > 0) {
      await expect(hrs.first()).toBeVisible();
      debug('Horizontal rules rendered');
    }

    debug('More information section markdown rendered correctly');
  });

  test('verify formatting elements are styled correctly', async ({ page }) => {
    debug('Navigating to public event page...');
    await page.goto(`/events/${eventId}`);
    await page.waitForLoadState('load');

    // Check for blockquotes in program section
    debug('Checking for blockquotes...');
    const blockquote = page.locator('#program blockquote');
    if ((await blockquote.count()) > 0) {
      await expect(blockquote.first()).toBeVisible();

      // Verify blockquote has border styling
      const borderStyle = await blockquote.first().evaluate(el => {
        return globalThis.getComputedStyle(el).borderLeftWidth;
      });
      expect(borderStyle).not.toBe('0px');
      debug('Blockquote has border styling');
    }

    // Check list styling
    debug('Checking list styling...');
    const list = page.locator('#program ul').first();
    const listStyle = await list.evaluate(el => {
      return globalThis.getComputedStyle(el).listStyleType;
    });
    expect(listStyle).toBe('disc');
    debug('Lists have correct list-style-type');

    debug('All formatting elements styled correctly');
  });
});
