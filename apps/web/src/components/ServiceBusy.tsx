'use client';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';

/**
 * Shown when the API answers 429: busy right now, try again shortly.
 * Pages can't send 429/503 from here, so keep crawlers from indexing it.
 */
export default function ServiceBusy() {
  const t = useTranslations();
  return (
    <>
      <meta name="robots" content="noindex" />
      <Heading>{t('common.errors.busy.title')}</Heading>
      <Text paddingY="sm">{t('common.errors.busy.description')}</Text>
      <Button onClick={() => window.location.reload()}>{t('common.errors.busy.retry')}</Button>
    </>
  );
}
