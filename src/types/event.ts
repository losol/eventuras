// Event type according to API data
// TODO: Check can props be null or always string. To prevent unnecessary null checks in components render
export type EventType = {
  category: string | null;
  city: string | null;
  dateEnd: string | null;
  dateStart: string | null;
  description: string | null;
  featured: boolean;
  id: number;
  lastRegistrationDate: string | null;
  location: string | null;
  onDemand: boolean;
  practicalInformation: string | null;
  program: string | null;
  slug: string | null;
  status: string | null;
  title: string | null;
  type: string | null;
};
