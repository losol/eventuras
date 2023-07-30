import { EVENT_STATUS, EVENT_TYPE } from 'const';
import { HTMLString } from 'types';

type ValueOf<T> = T[keyof T];

// Partials
export type EventStatusType = ValueOf<typeof EVENT_STATUS>;
export type EventTypeType = ValueOf<typeof EVENT_TYPE>;

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
