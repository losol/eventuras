import { LocalesAdmin } from '../types';

const LOCALES_ADMIN_NO: LocalesAdmin = {
  title: 'Admin',
  createEvent: {
    content: {
      title: 'Opprett hendelse',
      description: 'Her kan du lage ditt arrangement, husk å skrive inn både tittel og slug',
    },
    alreadyExists: {
      title: 'Hendelsen eksisterer allerede.',
      description: 'En hendelse med den sneglen eksisterer allerede, sneglen må være unik.',
    },
  },
  editEvent: {
    content: {
      title: 'Redigere Hendelsen',
      description: 'Rediger hendelsen nedenfor',
    },
  },
  eventColumns: {
    title: 'Tittel',
    location: 'Sted',
    when: 'Når',
    actions: 'Handlinger',
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

export default LOCALES_ADMIN_NO;
