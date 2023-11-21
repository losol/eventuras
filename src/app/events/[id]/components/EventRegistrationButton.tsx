'use client';
import createTranslation from 'next-translate/createTranslation';
import { useContext } from 'react';

import Link from '@/components/ui/Link';
import Loading from '@/components/ui/Loading';
import { UserContext } from '@/context/UserContext';
import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';

export type EventRegistrationButtonProps = {
  eventId: string | number;
};

export default function EventRegistrationButton({ eventId }: EventRegistrationButtonProps) {
  const { t } = createTranslation();
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const state = useContext(UserContext).userState;
  const profile = state.profile;
  const profileId: string | undefined = profile ? profile.id! : undefined;
  let isRegistered = false;

  const { loading, result } = useCreateHook(
    () =>
      sdk.registrations.getV3Registrations({
        userId: profileId,
        includeEventInfo: true,
        includeProducts: true,
      }),
    [profileId],
    () => profileId === undefined
  );

  if (loading) return <Loading />;
  if (result && result.data) {
    isRegistered = result.data.filter(reg => reg.eventId === eventId).length > 0;
  }
  return (
    <>
      {isRegistered ? (
        <div className="py-6 my-4">{t('common:registration.alreadyRegistered')}</div>
      ) : (
        <div className="my-4">
          <Link
            href={`/user/events/${eventId}/registration`}
            variant="button-primary"
            block
            data-test-id="event-registration-button"
          >
            {t('common:buttons.register-cta')}
          </Link>
        </div>
      )}
    </>
  );
}
