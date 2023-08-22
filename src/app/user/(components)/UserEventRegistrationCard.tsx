import React, { ReactElement } from 'react';

export type UserEventRegistrationCardProps = {
  eventTitle: string;
  eventDescription: string;
  startDate: any;
  endDate: any;
};
/**
 * Single registration card
 * @param  {UserEventRegistrationCardProps}UserEventRegistrationCardProps Contains the event details
 * @return {ReactElement} Renders a single card
 */
const UserEventRegistrationCard = ({
  eventTitle,
  eventDescription,
  startDate,
  endDate,
}: UserEventRegistrationCardProps): ReactElement => (
  <div className="mb-12 bg-white rounded-lg p-4 flex flex-col justify-between leading-normal">
    <h3 className="text-gray-900 font-bold text-l mb-2">{eventTitle}</h3>
    <p className="text-gray-900">{eventDescription}</p>
    <p className="text-gray-900">
      {startDate} → {endDate}{' '}
    </p>
  </div>
);

export default UserEventRegistrationCard;
