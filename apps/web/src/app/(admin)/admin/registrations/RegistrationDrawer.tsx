'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { RegistrationDto } from '@/lib/eventuras-sdk';

import { getRegistrationDetail } from './actions';
import Registration from './Registration';

const logger = Logger.create({
  namespace: 'web:admin:registrations',
  context: { component: 'RegistrationDrawer' },
});

type RegistrationDrawerProps = {
  registrationId: number | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function RegistrationDrawer({
  registrationId,
  isOpen,
  onClose,
}: Readonly<RegistrationDrawerProps>) {
  const t = useTranslations();
  const [registration, setRegistration] = useState<RegistrationDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || registrationId === null) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      const result = await getRegistrationDetail(registrationId);
      if (cancelled) return;

      if (result.success) {
        setRegistration(result.data);
      } else {
        logger.error({ registrationId, error: result.error }, 'Failed to load registration');
        setError(result.error.message);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, registrationId]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <Drawer.Header as="h3" className="text-black">
        {t('common.registrations.detailsPage.title')}
      </Drawer.Header>
      <Drawer.Body>
        {isLoading && <Loading />}
        {!isLoading && error && <Text color="error">{error}</Text>}
        {!isLoading && !error && registration && (
          <Registration registration={registration} adminMode />
        )}
      </Drawer.Body>
      <Drawer.Footer>
        {registrationId !== null && (
          <Link variant="button-outline" href={`/admin/registrations/${registrationId}`}>
            {t('common.labels.view')}
          </Link>
        )}
      </Drawer.Footer>
    </Drawer>
  );
}
