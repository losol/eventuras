// Event type according to API data
// TODO: Think. Maybe, change to EventApiDataType or EventDataType - to indicate that this is backend data
export type EventType = {
  category: string;
  city: string;
  dateEnd: string;
  dateStart: string;
  description: string;
  featured: boolean;
  id: number;
  lastRegistrationDate: string;
  location: string;
  onDemand: boolean;
  practicalInformation: string;
  program: string;
  slug: string;
  status: string;
  title: string;
  type: string;
};
