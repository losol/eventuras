import { LocalesAdmin } from '../types';

const LOCALES_ADMIN_EN: LocalesAdmin = {
  title: 'Admin',
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
  eventColumns: {
    title: 'Title',
    location: 'Location',
    when: 'When',
    actions: 'Actions',
  },
  eventEmailer: {
    title: 'Email participants',
    form: {
      body: {
        feedbackIncorrect: 'Needs at least 10 characters',
        feedbackNoInput: "Can't send an email without body!",
        label: 'Body',
      },
      status: {
        feedbackNoInput: 'Please Select at least one Status type',
        label: 'Status',
      },
      subject: {
        feedbackNoInput: 'Please provide a subject',
        label: 'Subject',
      },
      type: {
        feedbackNoInput: 'Please select at least one Type',
        label: 'Type',
      },
      successFeedback: 'Emails succesfully sent!',
    },
  },
};

export default LOCALES_ADMIN_EN;
