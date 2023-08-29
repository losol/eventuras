import { LocalesAdmin } from '../types';

const LOCALES_ADMIN_EN: LocalesAdmin = {
  createEvent: {
    content: {
      title: 'Create Event',
      description: 'Here you can create your event, be sure to enter both title and slug',
    },
    alreadyExists: {
      title: 'Event already Exists.',
      description: 'An Event with that slug already exists, the slug needs to be unique.',
    },
  },
  editEvent: {
    content: {
      title: 'Edit Event',
      description: 'Edit event below',
    },
  },
};

export default LOCALES_ADMIN_EN;
