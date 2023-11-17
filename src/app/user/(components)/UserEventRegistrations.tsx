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
  const { t } = createTranslation();

  return (
    <div>
      <Heading>{t('common:labels.registrations')}</Heading>
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
