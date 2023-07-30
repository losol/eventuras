// Used in types/event and components/event/EventCard
// If change types values in API - change exported consts here also
export const EVENT_STATUS = {
  DRAFT: 'Draft',
  PLANNED: 'Planned',
  REGISTRATIONS_OPEN: 'RegistrationsOpen',
  WAITING_LIST: 'WaitingList',
  REGISTRATIONS_CLOSED: 'RegistrationsClosed',
  FINISHED: 'Finished',
  ARCHIVED: 'Archived',
  CANCELLED: 'Cancelled',
} as const;

export const EVENT_TYPE = {
  COURSE: 'Course',
  CONFERENCE: 'Conference',
  ONLINE_COURSE: 'OnlineCourse',
  SOCIAL: 'Social',
  OTHER: 'Other',
} as const;

