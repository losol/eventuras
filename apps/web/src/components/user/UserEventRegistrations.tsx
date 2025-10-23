import { ReactElement } from 'react';
import { useTranslations } from 'next-intl';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';

import { RegistrationDto } from '@/lib/eventuras-sdk';

import UserEventRegistrationCard from './UserEventRegistrationCard';
export type UserEventRegistrationsProps = {
  registrations: RegistrationDto[];
};
/**
 * Renders a users event registrations
 * @param  {UserEventRegistrationsProps} Contains registrations
 * @return {ReactElement}  Returns a list of event registrations
 */
const UserEventRegistrations = ({ registrations }: UserEventRegistrationsProps): ReactElement => {
  const t = useTranslations();
  return (
    <div>
      <Heading>{t('common.labels.registrations')}</Heading>
      <Grid>
        {registrations.map(registration => {
          const event = registration.event!;
          const { id, title, description, dateStart, dateEnd } = event;
          return (
            <UserEventRegistrationCard
              key={registration.registrationId}
              registrationId={registration.registrationId!}
              eventTitle={title ?? ''}
              eventId={id?.toString() ?? ''}
              eventDescription={description ?? ''}
              dateStart={dateStart ?? ''}
              dateEnd={dateEnd ?? ''}
              products={registration.products ?? []}
            />
          );
        })}
      </Grid>
    </div>
  );
};
export default UserEventRegistrations;
