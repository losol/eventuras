import { RegistrationDto } from '@losol/eventuras';
import React, { ReactElement } from 'react';

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
const UserEventRegistrations = ({ registrations }: UserEventRegistrationsProps): ReactElement => (
  <div>
    <Heading>Your Event Registrations</Heading>
    {registrations.map(reg => {
      const event = reg.event!;
      const { title, description, dateStart, dateEnd } = event;
      return (
        <UserEventRegistrationCard
          key={event.id}
          eventTitle={title ?? ''}
          eventDescription={description ?? ''}
          startDate={dateStart ?? ''}
          endDate={dateEnd ?? ''}
          products={reg.products ?? []}
        />
      );
    })}
  </div>
);

export default UserEventRegistrations;
