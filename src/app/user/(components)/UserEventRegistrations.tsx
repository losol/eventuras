import { RegistrationDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React, { ReactElement } from 'react';

import Grid from '@/components/ui/Grid';
import Heading from '@/components/ui/Heading';

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
  const { t } = createTranslation('user');

  return (
    <div>
      <Heading>{t('Registrations')}</Heading>
      <Grid>
        {registrations.map(registration => {
          const event = registration.event!;
          const { title, description, dateStart, dateEnd } = event;
          return (
            <UserEventRegistrationCard
              key={registration.registrationId}
              registrationId={registration.registrationId!}
              eventTitle={title ?? ''}
              eventDescription={description ?? ''}
              startDate={dateStart ?? ''}
              endDate={dateEnd ?? ''}
              products={registration.products ?? []}
            />
          );
        })}
      </Grid>
    </div>
  );
};

export default UserEventRegistrations;
