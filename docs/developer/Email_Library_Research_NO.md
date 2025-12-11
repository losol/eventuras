# Forskning på Node.js E-postbibliotek for Eventuras

**Dato**: Desember 2025  
**Formål**: Evaluere Node.js e-postbibliotek for å lage et nytt e-postsendingsbibliotek i Eventuras monorepo

## Oppsummering

Dette dokumentet gir forskning og anbefalinger for implementering av et Node.js-basert e-postbibliotek for Eventuras. Dagens backend (C#) bruker SMTP og SendGrid, men det er behov for en TypeScript/Node.js e-postløsning som kan brukes på tvers av monorepoets TypeScript-applikasjoner (web, historia, convertoapi).

## Nåværende E-post Implementering

Eventuras har i dag:

1. **C# Backend E-post** (`apps/api/src/Losol.Communication.Email/`)
   - SMTP-støtte via `SmtpEmailSender.cs`
   - SendGrid-integrasjon via `SendGridEmailSender.cs`
   - Mock-implementering for testing
   - Filbasert e-postskriver for utvikling

2. **Eksisterende TypeScript E-postkode** (`libs/google-api/`)
   - Gmail API-integrasjon for OAuth-basert e-postsending
   - Brukes primært til E2E-testing (venting på verifikasjonse-poster)

## Sammenligning av Biblioteker

### 1. Nodemailer (Industristandard)

**Fordeler**:
- ✅ Null avhengigheter, velprøvd, åpen kildekode
- ✅ Flere transportalternativer (SMTP, SendGrid, SES, etc.)
- ✅ Utmerket plugin-økosystem
- ✅ Full kontroll over e-postsending
- ✅ Gratis og selvdrevet

**Ulemper**:
- ❌ Direkte SMTP kan være tregere
- ❌ Ingen innebygd analyse eller sporing
- ❌ Manuell køhåndtering nødvendig for bulke-poster
- ❌ Tradisjonelt API (ikke like moderne som nyere alternativer)

**Pris**: Gratis (open source)

---

### 2. Resend (Moderne Utviklerfokusert)

**Fordeler**:
- ✅ Utmerket utvikleropplevelse (TypeScript-native)
- ✅ React Email-integrasjon (JSX e-postmaler)
- ✅ Enkelt, intuitivt API
- ✅ Innebygde leveringsfunksjoner (SPF, DKIM, DMARC, BIMI)
- ✅ Sanntidswebhooks og analyse
- ✅ Sjenerøs gratis tier (3 000 e-poster/måned)
- ✅ Rask oppsett (e-poster sendt på minutter)
- ✅ Testmodus for utvikling
- ✅ GDPR/SOC2-kompatibel

**Ulemper**:
- ❌ Krever ekstern tjeneste (API-avhengighet)
- ❌ Leverandørlåsing
- ❌ Kort loggoppbevaring (1-7 dager avhengig av plan)
- ❌ Nyere plattform (færre enterprise case studies)

**Pris** (2025):
- **Gratis**: 3 000 transaksjone-poster/måned
- **Pro**: $20/måned (50 000 e-poster)
- **Scale**: $90/måned (100 000 e-poster)

**Eksempel**:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Eventuras <noreply@eventuras.com>',
  to: 'bruker@example.com',
  subject: 'Arrangementspåmelding Bekreftet',
  html: '<p>Takk for påmeldingen!</p>'
});
```

**Med React Email**:
```tsx
import { Resend } from 'resend';
import { EmailTemplate } from './EmailTemplate';

await resend.emails.send({
  from: 'Eventuras <onboarding@eventuras.com>',
  to: 'bruker@example.com',
  subject: 'Arrangementspåmelding Bekreftet',
  react: <EmailTemplate navn="Ola" arrangementsNavn="Sommerkurs" />
});
```

---

### 3. React Email (Malsystem)

**Fordeler**:
- ✅ Skriv e-postmaler i React/JSX
- ✅ Komponentbasert, gjenbrukbar design
- ✅ Live forhåndsvisning i utvikling
- ✅ TypeScript-støtte
- ✅ Responsiv som standard
- ✅ Fungerer med hvilken som helst e-postavsender (Nodemailer, Resend, SendGrid, etc.)
- ✅ Versjonskontrollvennlig

**Eksempel**:
```tsx
import { Html, Head, Body, Container, Button } from '@react-email/components';

export function ArrangementsBekreftelse({ arrangementsNavn, brukerNavn }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc' }}>
        <Container>
          <h1>Arrangementspåmelding Bekreftet</h1>
          <p>Hei {brukerNavn},</p>
          <p>Du er påmeldt {arrangementsNavn}!</p>
          <Button href="https://eventuras.com/events">Se Arrangement</Button>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## Anbefaling for Eventuras

### Hovedanbefaling: **Resend + React Email**

**Begrunnelse**:

1. **Perfekt for Eventuras Teknologistabel**:
   - TypeScript-først (matcher apps/web, apps/historia)
   - React Email-maler stemmer overens med eksisterende React-kompetanse
   - Fungerer sømløst med Next.js server actions

2. **Utvikleropplevelse**:
   - Rask oppsett og iterasjon
   - Type-safe API
   - Moderne, intuitivt design
   - Utmerket dokumentasjon

3. **Kostnadseffektivt**:
   - Gratis tier (3 000 e-poster/måned) tilstrekkelig for utvikling og små implementeringer
   - Forutsigbar prising for produksjon

4. **Leveringskvalitet**:
   - Innebygd autentisering (SPF, DKIM, DMARC)
   - Administrert infrastruktur
   - Høye innbokshastigheter

5. **Eventuras Fordeler**:
   - Del e-postmaler på tvers av web og historia
   - Versjonskontroll av e-postmaler (ingen ekstern malredigerer nødvendig)
   - Enkel testing med testmodus
   - Webhooks for leveringssporing

**Implementeringsstruktur**:

```
libs/
  email/                          # Nytt delt bibliotek
    src/
      index.ts                    # Hovedeksporter
      client.ts                   # Resend klient oppsett
      types.ts                    # TypeScript typer
    templates/                    # React Email maler
      ArrangementsBekreftelse.tsx
      ArrangementsPaaminning.tsx
      PassordTilbakestilling.tsx
      shared/                     # Delte komponenter
        Layout.tsx
        Button.tsx
        Header.tsx
        Footer.tsx
```

### Sekundær Anbefaling: **Nodemailer + React Email**

**For tilfeller der**:
- Full kontroll er påkrevd
- Ingen eksterne API-avhengigheter tillatt
- Eksisterende SMTP-infrastruktur må brukes
- Kostnad må minimeres absolutt

---

## Implementeringsplan

### Fase 1: Bibliotekoppsett

1. **Opprett Pakke**:
   ```bash
   mkdir -p libs/email
   cd libs/email
   pnpm init
   ```

2. **Installer Avhengigheter**:
   ```bash
   pnpm add resend @react-email/components @react-email/render
   pnpm add -D typescript @eventuras/typescript-config
   ```

### Fase 2: Kjerne Implementering

1. **E-postklient**:
```typescript
// libs/email/src/client.ts
import { Resend } from 'resend';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'email' });

export interface EmailClientConfig {
  apiKey: string;
  fromAddress: string;
  fromName: string;
}

export function createEmailClient(config: EmailClientConfig) {
  const resend = new Resend(config.apiKey);
  
  return {
    async send(options: SendEmailOptions) {
      logger.info({ to: options.to }, 'Sender e-post');
      
      try {
        const result = await resend.emails.send({
          from: `${config.fromName} <${config.fromAddress}>`,
          to: options.to,
          subject: options.subject,
          react: options.template,
        });
        
        logger.info({ id: result.data?.id }, 'E-post sendt vellykket');
        return result;
      } catch (error) {
        logger.error({ error }, 'Mislyktes i å sende e-post');
        throw error;
      }
    }
  };
}
```

2. **Mal Base**:
```tsx
// libs/email/templates/shared/Layout.tsx
import { Html, Head, Body, Container } from '@react-email/components';

export function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          {children}
        </Container>
      </Body>
    </Html>
  );
}
```

### Fase 3: Integrasjon

**Server Actions** (apps/web):
```typescript
'use server';

import { createEmailClient } from '@eventuras/email';
import { ArrangementsBekreftelse } from '@eventuras/email/templates';

export async function sendBekreftelsesEpost(userId: string, eventId: number) {
  const emailClient = createEmailClient({
    apiKey: process.env.RESEND_API_KEY!,
    fromAddress: 'noreply@eventuras.com',
    fromName: 'Eventuras'
  });

  await emailClient.send({
    to: bruker.email,
    subject: 'Arrangementspåmelding Bekreftet',
    template: <ArrangementsBekreftelse {...data} />
  });
}
```

---

## Kostnadsanalyse

### Resend Gratis Tier
- 3 000 e-poster/måned
- Egnet for:
  - Utviklingsmiljøer
  - Små til mellomstore arrangementsplattformer
  - Testing og staging

### Resend Pro ($20/måned)
- 50 000 e-poster/måned = $0,0004 per e-post
- Egnet for:
  - Produksjonsimplementeringer
  - ~1 600 e-poster/dag
  - Mellomstore arrangementsplattformer

### Nodemailer (Selvdrevet SMTP)
- Kun infrastrukturkostnader
- Krever:
  - SMTP-servervedlikehold
  - IP-omdømmehåndtering
  - Leveringsovervåking

---

## Konklusjon

**Anbefalt**: Implementer **Resend + React Email** som hovedløsningen for Eventuras.

**Nøkkelfordeler**:
1. Moderne, TypeScript-først utvikleropplevelse
2. Stemmer perfekt overens med eksisterende React/Next.js stack
3. Utmerket leveringskvalitet rett ut av boksen
4. Kostnadseffektivt med sjenerøs gratis tier
5. Versjonskontrollerte e-postmaler
6. Enkel testing og iterasjon
7. Skalerbar prismodell

**Neste Steg**:
1. Opprett `libs/email` pakke
2. Installer Resend og React Email avhengigheter
3. Implementer kjerne e-postklient
4. Opprett delte e-postlayout-komponenter
5. Migrer eksisterende e-postmaler til React Email
6. Integrer med apps/web server actions
7. Legg til omfattende tester
8. Dokumenter bruksmønstre

---

## Referanser

- [Resend Offisiell Dokumentasjon](https://resend.com/docs)
- [React Email Dokumentasjon](https://react.email/)
- [Nodemailer Dokumentasjon](https://nodemailer.com/)
- [E-post Best Practices - Mailtrap](https://mailtrap.io/blog/send-emails-with-nodejs/)
- Se også: `Email_Library_Research.md` for fullstendig engelskspråklig dokumentasjon
