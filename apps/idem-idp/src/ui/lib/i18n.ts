import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      admin: {
        dashboard: {
          title: 'Admin Dashboard',
          welcome: 'Welcome, {{name}}',
          clients: {
            title: 'OAuth Clients',
            description: 'Manage OAuth 2.0 and OIDC client applications',
          },
          accounts: {
            title: 'User Accounts',
            description: 'Manage user accounts and roles (Coming soon)',
          },
          idps: {
            title: 'Identity Providers',
            description: 'Configure external IdPs (Vipps, HelseID, etc.) (Coming soon)',
          },
          keys: {
            title: 'Signing Keys',
            description: 'Manage JWKS signing keys and rotation (Coming soon)',
          },
          testFlow: {
            title: 'Test OAuth Flow',
            description: 'Want to test the OIDC provider? Use the login page with OTP authentication.',
            button: 'Go to Login Page',
          },
        },
        clients: {
          title: 'OAuth Clients',
          backToDashboard: 'Back to Dashboard',
          clientsCount: '{{count}} client configured',
          clientsCount_other: '{{count}} clients configured',
          noClients: 'No OAuth clients configured yet.',
          noClientsHint: 'Clients can be added through database seeding or the API.',
          table: {
            clientId: 'Client ID',
            name: 'Name',
            type: 'Type',
            pkce: 'PKCE',
            status: 'Status',
            redirectUris: 'Redirect URIs',
          },
          types: {
            confidential: 'confidential',
            public: 'public',
          },
          status: {
            active: 'Active',
            inactive: 'Inactive',
          },
        },
      },
      auth: {
        login: {
          title: 'Sign In',
          description: 'Sign in to access the admin panel',
          button: 'Sign In with Email',
        },
        logout: 'Logout',
      },
    },
  },
  no: {
    translation: {
      admin: {
        dashboard: {
          title: 'Administrasjonspanel',
          welcome: 'Velkommen, {{name}}',
          clients: {
            title: 'OAuth-klienter',
            description: 'Administrer OAuth 2.0 og OIDC-klientapplikasjoner',
          },
          accounts: {
            title: 'Brukerkontoer',
            description: 'Administrer brukerkontoer og roller (Kommer snart)',
          },
          idps: {
            title: 'Identitetsleverandører',
            description: 'Konfigurer eksterne IdP-er (Vipps, HelseID, osv.) (Kommer snart)',
          },
          keys: {
            title: 'Signeringsnøkler',
            description: 'Administrer JWKS-signeringsnøkler og rotasjon (Kommer snart)',
          },
          testFlow: {
            title: 'Test OAuth-flyt',
            description: 'Vil du teste OIDC-leverandøren? Bruk innloggingssiden med OTP-autentisering.',
            button: 'Gå til innloggingssiden',
          },
        },
        clients: {
          title: 'OAuth-klienter',
          backToDashboard: 'Tilbake til oversikten',
          clientsCount: '{{count}} klient konfigurert',
          clientsCount_other: '{{count}} klienter konfigurert',
          noClients: 'Ingen OAuth-klienter konfigurert ennå.',
          noClientsHint: 'Klienter kan legges til via databaseseeding eller API-et.',
          table: {
            clientId: 'Klient-ID',
            name: 'Navn',
            type: 'Type',
            pkce: 'PKCE',
            status: 'Status',
            redirectUris: 'Redirect-URIer',
          },
          types: {
            confidential: 'konfidensiell',
            public: 'offentlig',
          },
          status: {
            active: 'Aktiv',
            inactive: 'Inaktiv',
          },
        },
      },
      auth: {
        login: {
          title: 'Logg inn',
          description: 'Logg inn for å få tilgang til administrasjonspanelet',
          button: 'Logg inn med e-post',
        },
        logout: 'Logg ut',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'no',
  fallbackLng: 'no',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
