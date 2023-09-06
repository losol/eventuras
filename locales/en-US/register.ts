import { LocalesEventRegistration } from '../types';

const LOCALES_REGISTER_EN: LocalesEventRegistration = {
  customize: {
    title: 'Customize your order',
    description: 'We have some nice experiences to offer',
  },
  payment: {
    title: 'Payment details',
    description: 'A few more details',
    subHeading: 'Who are paying',
  },
  complete: {
    title: 'Welcome!',
    description: 'We really look forward to see you!',
  },
  buttons: {
    register: 'Register for this Event',
  },
  feedback: {
    allreadyRegistered: 'You are registered for this event, see you soon!',
  },
};

export default LOCALES_REGISTER_EN;
