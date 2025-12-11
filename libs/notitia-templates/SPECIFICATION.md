# Notitia Templates - Bibliotekspesifikasjon

## Oversikt

**Notitia Templates** er et Handlebars-basert bibliotek for å generere personaliserte SMS- og e-posttekster. Biblioteket leveres med et sett standardmaler, men støtter også egendefinerte og overstyrte maler.

- **Biblioteksnavn**: `@eventuras/notitia-templates`
- **Plassering**: `libs/notitia-templates`
- **Versjon**: 0.1.0
- **Lisens**: MIT
- **Templating-engine**: Handlebars 4.7.8

## Hovedfunksjonalitet

### 1. Template Rendering

Maler renderes ved å kombinere dem med et objekt av navngitte parametere. Resultatet er en ferdig personalisert tekststreng, klar til bruk i enhver varslingskanal.

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

const resultat = notitiaTemplates.render('email', 'welcome', {
  name: 'Ola Nordmann',
  organizationName: 'Eventuras',
  loginUrl: 'https://app.eventuras.com/login',
});

// resultat.subject: "Welcome to Eventuras"
// resultat.content: "Hello Ola Nordmann,\n\nWelcome to Eventuras!..."
```

### 2. Standardmaler

Biblioteket leveres med standardmaler for vanlige varslingssituasjoner:

#### E-postmaler
- `email:welcome` - Velkomstmelding for nye brukere
- `email:registration-confirmation` - Bekreftelse på arrangementspåmelding
- `email:event-reminder` - Påminnelse om kommende arrangement
- `email:payment-confirmation` - Bekreftelse på vellykket betaling
- `email:password-reset` - Instruksjoner for tilbakestilling av passord
- `email:order-confirmation` - Bekreftelse på bestilling
- `email:order-shipped` - Varsel om forsendelse

#### SMS-maler
- `sms:welcome` - Velkomst-SMS (kort versjon)
- `sms:registration-confirmation` - Påmeldingsbekreftelse (kort versjon)
- `sms:event-reminder` - Arrangementspåminnelse (kort versjon)
- `sms:payment-confirmation` - Betalingsbekreftelse (kort versjon)
- `sms:password-reset` - Passordtilbakestilling (kort versjon)
- `sms:order-confirmation` - Bestillingsbekreftelse (kort versjon)
- `sms:order-shipped` - Forsendelsesvarsel (kort versjon)

### 3. Egendefinerte Maler

Brukere kan enkelt overstyre standardmaler eller opprette helt nye:

```typescript
// Overstyr standardmal
notitiaTemplates.registerTemplate('email', 'welcome', {
  subject: 'Velkommen til {{organizationName}}',
  content: 'Hei {{name}}, velkommen til vår plattform!',
  description: 'Tilpasset velkomstmelding på norsk',
});

// Opprett ny mal
notitiaTemplates.registerTemplate('email', 'custom', {
  subject: 'Spesialtilbud for {{name}}',
  content: 'Vi har et spesialtilbud til deg: {{offerText}}',
});
```

### 4. Handlebars-funksjoner

Biblioteket inkluderer innebygde hjelpefunksjoner:

- **formatDate** - Formaterer datoer
- **upper** - Konverterer tekst til store bokstaver
- **lower** - Konverterer tekst til små bokstaver  
- **eq** - Sammenligner verdier for likhet

Egendefinerte hjelpefunksjoner kan også registreres:

```typescript
notitiaTemplates.registerHelper('currency', function (amount: number, currency: string) {
  return `${amount.toFixed(2)} ${currency}`;
});
```

## Arkitektur

### Klassestruktur

```typescript
class NotitiaTemplates {
  // Render en mal med parametere
  render(channel, type, params, options?): RenderedTemplate
  
  // Render egendefinert malstreng direkte
  renderCustom(templateString, params, options?): string
  
  // Registrer egendefinert mal
  registerTemplate(channel, type, template): void
  
  // Registrer flere maler samtidig
  registerTemplates(templates): void
  
  // Fjern egendefinert mal
  unregisterTemplate(channel, type): void
  
  // Tøm alle egendefinerte maler
  clearCustomTemplates(): void
  
  // Registrer Handlebars-hjelpefunksjon
  registerHelper(name, helper): void
  
  // Sjekk om mal eksisterer
  hasTemplate(channel, type): boolean
  
  // Hent tilgjengelige malnøkler
  getAvailableTemplates(): string[]
  
  // Hent mal-metadata
  getTemplateInfo(channel, type): Template | undefined
}
```

### TypeScript-typer

```typescript
type NotificationChannel = 'email' | 'sms';

type TemplateType = 
  | 'welcome'
  | 'registration-confirmation'
  | 'event-reminder'
  | 'payment-confirmation'
  | 'password-reset'
  | 'order-confirmation'
  | 'order-shipped'
  | 'custom';

interface Template {
  content: string;
  subject?: string;
  description?: string;
}

interface RenderedTemplate {
  content: string;
  subject?: string;
}

interface RenderOptions {
  strict?: boolean;
  helpers?: { [name: string]: Handlebars.HelperDelegate };
}
```

## Bruksområder

### 1. Enkel bruk (Singleton)

For enkle applikasjoner med konsistente maler:

```typescript
import { notitiaTemplates } from '@eventuras/notitia-templates';

const email = notitiaTemplates.render('email', 'welcome', { 
  name: 'Kari',
  organizationName: 'Min Bedrift' 
});
```

### 2. Flerbrukerinstanser (Multi-tenant)

For applikasjoner med flere klienter som trenger egne maler:

```typescript
import { createNotitiaTemplates } from '@eventuras/notitia-templates';

const tenant1Templates = createNotitiaTemplates();
const tenant2Templates = createNotitiaTemplates();

tenant1Templates.registerTemplate('email', 'welcome', {
  subject: 'Velkommen til Kunde 1',
  content: 'Spesialtilpasset for kunde 1...',
});

tenant2Templates.registerTemplate('email', 'welcome', {
  subject: 'Welcome to Customer 2',
  content: 'Custom for customer 2...',
});
```

### 3. E-handelsflyt

```typescript
// Bestillingsbekreftelse
const orderEmail = notitiaTemplates.render('email', 'order-confirmation', {
  name: 'Per Hansen',
  orderId: 'ORD-12345',
  orderDate: '2025-06-10',
  totalAmount: '1499.00',
  currency: 'NOK',
  organizationName: 'Min Nettbutikk',
});

// Forsendelsesvarsel
const shipmentEmail = notitiaTemplates.render('email', 'order-shipped', {
  name: 'Per Hansen',
  orderId: 'ORD-12345',
  trackingNumber: 'TRACK-67890',
  estimatedDelivery: '2025-06-20',
  organizationName: 'Min Nettbutikk',
});
```

### 4. Arrangementshåndtering

```typescript
// Påmeldingsbekreftelse
const confirmation = notitiaTemplates.render('email', 'registration-confirmation', {
  name: 'Line Olsen',
  eventTitle: 'Sommerkonferanse 2025',
  eventDate: '2025-07-15',
  eventLocation: 'Oslo Kongressenter',
  registrationId: 'REG-789',
  organizationName: 'Eventuras',
});

// SMS-påminnelse
const reminder = notitiaTemplates.render('sms', 'event-reminder', {
  organizationName: 'Eventuras',
  eventTitle: 'Sommerkonferanse',
  eventDate: '15. juli',
  eventLocation: 'Oslo',
});
```

## Tekniske detaljer

### Avhengigheter

**Produksjonsavhengigheter:**
- `handlebars` ^4.7.8 - Templating-engine

**Utviklingsavhengigheter:**
- `vite` 7.2.6 - Byggeverktøy
- `vitest` 4.0.15 - Testrammeverk
- `typescript` 5.9.3 - Type-støtte
- `@eventuras/vite-config` - Delte byggkonfigurasjoner
- `@eventuras/typescript-config` - Delte TypeScript-konfigurasjoner

### Bygging

```bash
pnpm build  # Bygger biblioteket med Vite
pnpm dev    # Utviklingsmodus med watch
pnpm test   # Kjører tester (28 tester)
pnpm lint   # Kjører linting
```

### Testing

Biblioteket har omfattende testsuite med 28 tester som dekker:
- Rendering av standardmaler
- Egendefinerte maler og overstyring
- Betingede blokker og logikk
- Innebygde og egendefinerte hjelpefunksjoner
- Feilhåndtering
- Malmeldingshåndtering

### Node.js-kompatibilitet

Biblioteket er bygget for Node.js 18+ og bruker ESM (ECMAScript Modules). For å håndtere TypeScript-konfigurasjoner i Vite med Node 20, bruker byggscriptet `NODE_OPTIONS="--import tsx"`.

## Fordeler

1. **Enhetlig grensesnitt**: Samme API for SMS og e-post
2. **Fleksibel**: Fra enkle til komplekse meldinger
3. **Utvidbar**: Lett å legge til nye maler og hjelpefunksjoner
4. **Type-sikker**: Full TypeScript-støtte
5. **Testet**: Omfattende testsuite
6. **Dokumentert**: Detaljert README med eksempler
7. **Isolert**: Hver instans har eget malregister

## Fremtidig utvidelse

Biblioteket er designet for å enkelt kunne utvides med:
- Flere standardmaler etter behov
- Støtte for flere språk (i18n)
- Malvalidering
- Mal-caching for ytelse
- Asynkron rendering
- Mal-versjoneringssystem
- Integrasjon med externe maldatabaser

## Konklusjon

Notitia Templates gir en enhetlig og fleksibel måte å håndtere varslingsmeldinger på tvers av ulike kanaler. Med sitt sterke fundament i Handlebars og omfattende standardmaler, gjør det det enkelt å komme i gang, samtidig som det er fleksibelt nok til å dekke avanserte bruksområder og tilpasningsbehov.
