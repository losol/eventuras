import { EventInfoStatus, EventInfoType } from '@losol/eventuras';
import { HTMLString } from 'types';

type ValueOf<T> = T[keyof T];

// Partials
export type EventStatusType = ValueOf<typeof EventInfoStatus>;
export type EventTypeType = ValueOf<typeof EventInfoType>;

// Event Preview (card)
export type EventPreviewType = {
  category: string | null;
  city: string;
  dateEnd: string;
  dateStart: string;
  description: string;
  featured: boolean;
  id: number;
  lastRegistrationDate: string;
  location: string;
  onDemand: boolean;
  practicalInformation: HTMLString | null;
  program: HTMLString;
  slug: string;
  status: EventStatusType;
  title: string;
  type: EventTypeType;
};
