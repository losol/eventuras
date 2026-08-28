/**
 * Validates the sticky two-row navigation on the public event detail page:
 * - the section nav sticks directly under the site navbar while scrolling
 * - clicking a section link lands the section below the sticky bars
 * - scroll-spy marks the section in view with aria-current="location"
 *
 * The event is created via API with content in every section, plus filler in
 * the last one so the program section can scroll all the way up under the bars.
 */

import { Logger } from '@eventuras/logger';
import { expect, test } from '@playwright/test';

import { adminApi } from '../../shared/api-helpers';
import { generateTestEventData } from '../../shared/testEventData';

const logger = Logger.create({ namespace: 'e2e:section-nav' });

test.describe.configure({ mode: 'serial' });
const eventName = `Section Nav Test Event - ${Math.floor(Date.now() / 1000 / 10)}`;
let eventId: string;

const filler = Array.from(
  { length: 30 },
  (_, i) => `Paragraph ${i + 1}: filler text so the page is long enough to scroll.`
).join('\n\n');

test.use({ storageState: 'tmp/auth/admin.json' });

test.describe('section navigation on public event page', () => {
  test('create event with content in every section via API', async () => {
    const eventData = generateTestEventData(eventName);
    logger.debug({ title: eventData.title }, 'Creating event via API');

    const created = await adminApi.post<{ id: number }>('/v3/events', {
      title: eventData.title,
      slug: `section-nav-test-${Math.floor(Date.now() / 1000)}`,
      headline: eventData.headline,
      category: eventData.category,
      description: eventData.description,
      program: eventData.program,
      practicalInformation: `${eventData.practicalInformation}\n\n${filler}`,
      moreInformation: eventData.moreInformation,
      status: 'RegistrationsOpen',
      maxParticipants: eventData.maxParticipants,
      city: eventData.city,
      location: eventData.location,
      organizationId: 1,
    });

    eventId = created.id.toString();
    logger.debug({ eventId }, 'Event created via API');
  });

  test('section nav sticks under the site navbar and highlights the section in view', async ({
    page,
  }) => {
    await page.goto(`/events/${eventId}`);
    await page.waitForLoadState('load');

    const siteNav = page.locator('nav').first();
    const sectionNav = page.locator('nav', { has: page.locator('a[href="#program"]') });
    await expect(sectionNav).toBeVisible();

    logger.debug('Checking section links...');
    const hrefs = await sectionNav
      .locator('a')
      .evaluateAll(links => links.map(link => link.getAttribute('href')));
    expect(hrefs).toEqual([
      '#more-information',
      '#program',
      '#practical-information',
      '#registration',
    ]);

    logger.debug('Clicking the program link...');
    await sectionNav.locator('a[href="#program"]').click();
    const program = page.locator('#program');
    await expect(program).toBeInViewport();
    await expect(sectionNav.locator('a[href="#program"]')).toHaveAttribute(
      'aria-current',
      'location'
    );
    await expect(sectionNav.locator('a[href="#more-information"]')).not.toHaveAttribute(
      'aria-current',
      /.+/
    );

    logger.debug('Checking the sticky stack...');
    expect(await page.evaluate(() => globalThis.scrollY)).toBeGreaterThan(0);
    const siteBox = await siteNav.boundingBox();
    const navBox = await sectionNav.boundingBox();
    const programBox = await program.boundingBox();
    expect(siteBox?.y).toBe(0);
    expect(navBox?.y).toBeCloseTo(siteBox!.y + siteBox!.height, 0);
    expect(programBox!.y).toBeGreaterThanOrEqual(navBox!.y + navBox!.height);

    logger.debug('Scrolling on to practical information...');
    await page.evaluate(() => document.querySelector('#practical-information')?.scrollIntoView());
    await expect(sectionNav.locator('a[href="#practical-information"]')).toHaveAttribute(
      'aria-current',
      'location'
    );
    const navBoxAfter = await sectionNav.boundingBox();
    expect(navBoxAfter?.y).toBeCloseTo(siteBox!.y + siteBox!.height, 0);

    logger.debug('Section nav is sticky and tracks the section in view');
  });
});
