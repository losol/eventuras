import { LocalesAdmin } from '../types';

const LOCALES_ADMIN_NO: LocalesAdmin = {
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
};

export default LOCALES_ADMIN_NO;
