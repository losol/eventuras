'use client';
import useTranslation from 'next-translate/useTranslation';
import { useContext } from 'react';

import { Loading } from '@/components/feedback';
import Link from '@/components/inputs/Link';
import { UserContext } from '@/context/UserContext';
import { useUserEventRegistrations } from '@/hooks/apiHooks';

export type EventRegistrationButtonProps = {
  eventId: string | number;
};

export default function EventRegistrationButton({ eventId }: EventRegistrationButtonProps) {
  const { t } = useTranslation('register');
  const state = useContext(UserContext).userState;
  const profile = state.profile;
  const { loading, userRegistrations } = useUserEventRegistrations(profile?.id);
  let isRegistered = false;

  if (state.auth?.isAuthenticated) {
    if (loading) return <Loading />;
    isRegistered = userRegistrations.filter(reg => reg.eventId === eventId).length > 0;
  }

  return (
    <div>
      {isRegistered ? (
        <div className="py-6">{t('feedback.allreadyRegistered')}</div>
      ) : (
        <Link href={`/user/events/${eventId}/registration`} variant="button-primary" block>
          {t('buttons.register')}
        </Link>
      )}
    </div>
  );
}
