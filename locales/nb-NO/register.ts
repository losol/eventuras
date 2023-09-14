import { LocalesEventRegistration } from '../types';

const LOCALES_REGISTER_NO: LocalesEventRegistration = {
  customize: {
    title: 'Tilpass din bestilling',
    description: 'Vi har noen flotte opplevelser å tilby',
  },
  payment: {
    title: 'Betalingsdetaljer',
    description: 'Noen flere detaljer',
    subHeading: 'Hvem betaler',
  },
  form: {
    customertype: {
      legend: 'Kundetype',
      private: 'Privat',
      business: 'Bedrift',
    },
    user: {
      legend: 'Brukerdetaljer',
      name: 'Navn',
      email: 'E-post',
      phoneNumber: 'Telefonnummer',
    },
    address: {
      legend: 'Adresse',
      street: 'Gate',
      zip: 'Postnummer',
      city: 'By',
      country: 'Land',
    },
    businessinfo: {
      legend: 'Bedriftsinformasjon',
      vatNumber: 'MVA-nummer',
      invoiceReference: 'Fakturareferanse',
    },
  },
  complete: {
    title: 'Velkommen!',
    description: 'Vi ser virkelig frem til å se deg!',
  },
  buttons: {
    register: 'Registrer deg for dette arrangementet',
  },
  feedback: {
    allreadyRegistered: 'Du er allerede registrert for dette arrangementet, vi sees snart!',
  },
};

export default LOCALES_REGISTER_NO;
