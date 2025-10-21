'use client';
import { useTranslations } from 'next-intl';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Link } from '@eventuras/ratio-ui-next/Link';

export default function EventNotFound() {
  const t = useTranslations();
  return (
    <>
      <Heading>{t('common.events.detailspage.notfound.title')}</Heading>
      <Text className="py-6">{t('common.events.detailspage.notfound.description')}</Text>
      <Link href="/" variant="button-primary">
        {t('common.events.detailspage.notfound.back')}
      </Link>
    </>
  );
}
