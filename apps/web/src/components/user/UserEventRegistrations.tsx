import { RegistrationDto } from '@eventuras/sdk';
import { Grid, Heading } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';
import { ReactElement } from 'react';

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
  const t = await getTranslations();

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
