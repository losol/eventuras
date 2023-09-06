'use client';
import useTranslation from 'next-translate/useTranslation';
import { useContext } from 'react';

import { Loading } from '@/components/feedback';
import { BlockLink } from '@/components/inputs/Link';
import { UserContext } from '@/context/UserContext';
import { useEventRegistrations } from '@/hooks/apiHooks';

export type EventRegistrationButtonProps = {
  eventId: string | number;
};

export default function EventRegistrationButton({ eventId }: EventRegistrationButtonProps) {
  const { t } = useTranslation('register');

  const { profile } = useContext(UserContext).userState;
  const { loading, userRegistrations } = useEventRegistrations(profile?.id);
  if (loading) return <Loading />;
  const isRegistered = userRegistrations.filter(reg => reg.eventId === eventId).length > 0;

  return (
    <div>
      {isRegistered ? (
        <div>{t('feedback.allreadyRegistered')}</div>
      ) : (
        <BlockLink href={`/user/events/${eventId}}/registration`}>
          {t('buttons.register')}
        </BlockLink>
      )}
    </div>
  );
}
