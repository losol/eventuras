import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';

const LOCALES = ['nb-NO', 'en-US'] as const;
const localesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../locales');

const translatorFor = (locale: string) =>
  createTranslator({
    locale,
    messages: {
      admin: JSON.parse(readFileSync(path.join(localesDir, locale, 'admin.json'), 'utf8')),
    },
  });

/**
 * The send confirmation is the last thing an admin reads before an
 * irreversible send, so its plural forms are checked against the real
 * formatter rather than eyeballed.
 */
describe.each(LOCALES)('%s notification confirmation', locale => {
  const t = translatorFor(locale);
  const audience = 'Hjertesykdommer – NORDLANDSUKA';

  it('names the audience without a stray count when nobody matches', () => {
    const message = t('admin.eventNotifier.confirm.audience', { count: 0, audience });

    expect(message).toContain(audience);
    expect(message).not.toMatch(/\b0\b/);
  });

  it.each([1, 28])('counts %i recipients alongside the audience', count => {
    const message = t('admin.eventNotifier.confirm.audience', { count, audience });

    expect(message).toContain(String(count));
    expect(message).toContain(audience);
  });

  it('counts recipients on the send button', () => {
    expect(t('admin.eventNotifier.confirm.send', { count: 1 })).toContain('1');
    expect(t('admin.eventNotifier.confirm.send', { count: 28 })).toContain('28');
  });
});
