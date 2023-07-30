import { EventPreviewType, UserType } from 'types';

export type UserEventRegistrationType = {
  userId: string;
  eventId: string;
};

export type RegistrationType = {
  registrationId: number;
  eventId: number;
  userId: string;
  status: string;
  type: string;
  certificateId: number;
  notes: string;
  user: UserType;
  event: EventPreviewType;
};
