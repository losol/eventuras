import { type LocalesCommonType } from '../types';

const LOCALES_COMMON_EN: LocalesCommonType = {
  // Header
  header: {
    auth: {
      login: 'Login',
      logout: 'Logout',
    },
  },
  // Common section titles
  event: 'Event',
  events: 'Events',
  onlinecourses: 'Online courses',
  buttons: {
    submit: 'Submit',
    continue: 'Continue',
    send: 'Send',
    cancel: 'Cancel',
  },
  errors: {
    fatalError: {
      title: 'Something went very wrong',
      description:
        'We tried to perform the action, but something went wrong, please try again later.',
    },
  },
};

export default LOCALES_COMMON_EN;
