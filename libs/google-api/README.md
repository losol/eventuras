# @eventuras/google-api

Helper utilities for interacting with Google APIs inside Eventuras. The package wraps common OAuth and Gmail helper flows that are shared across services.

## Features

- Simple helpers for constructing OAuth2 clients.
- Convenience methods for working with service-account credentials.
- Gmail helpers for composing MIME messages, searching for messages, waiting for new mail, and sending via the REST API.

## Setting Up Gmail OAuth

You need a Google Cloud project with Gmail API enabled before using the OAuth helpers:

1. **Create or select a project** in the [Google Cloud Console](https://console.cloud.google.com/).
2. **Enable the Gmail API** under **APIs & Services → Library**.
3. **Configure the OAuth consent screen** (Internal for Workspace tenants or External for public apps) and supply the required details.
4. **Create OAuth client credentials** via **APIs & Services → Credentials → Create credentials → OAuth client ID**, supplying the redirect URIs your app will use.
5. **Store the Client ID and Client Secret securely**, typically through environment variables (e.g. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`).

Helpful references:

- [Gmail API Quickstart for Node.js](https://developers.google.com/gmail/api/quickstart/nodejs)
- [Google Cloud docs: Create OAuth client IDs](https://cloud.google.com/docs/authentication/getting-started)

## Usage

```ts
import {
  buildRawMessage,
  createOAuthClient,
  createServiceAccountClient,
  createGmailClient,
  getMessage,
  getPlainTextBody,
  sendGmailMessage,
  waitForMessage,
} from "@eventuras/google-api";

const oauthClient = createOAuthClient({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

const gmail = createGmailClient(oauthClient);
const message = await waitForMessage(gmail, {
  query: `to:${userEmail} "verification code" newer_than:5m`,
  maxAttempts: 5,
  intervalMs: 3000,
});

if (message?.id) {
  const fullMessage = await getMessage(gmail, { id: message.id });
  const textBody = fullMessage ? getPlainTextBody(fullMessage) : undefined;
  // Extract the OTP from textBody here...
}
```

Sending email is equally straightforward:

```ts
await sendGmailMessage(gmail, {
  from: "Example <example@example.com>",
  to: "recipient@example.com",
  subject: "Hello from Eventuras",
  textBody: "This email was sent through the shared Google API helpers.",
});
```

## Building

```sh
pnpm --filter @eventuras/google-api build
```
