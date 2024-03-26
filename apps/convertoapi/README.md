# ConvertoAPI pdf generator

## Installation

`npm install` as usual. But you might need to install playwright dependencies with `npx playwright install`.

Copy `.env.template` to `.env` and fill in the values.

Then you may run the app with `npm run dev`.

## Usage

### Get a token

```bash
curl --request POST \
  --url http://localhost:3100/token \
  --header 'Content-Type: application/json' \
  --data '{
  "grant_type": "client_credentials",
  "client_id": "id",
  "client_secret": "secret"
}'
```

### Generate a PDF

Use the token you received in the previous step to generate a PDF.

```bash
curl --request POST \
  --url http://localhost:3100/v1/pdf \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer {TOKEN_HERE}' \
  --data '{
    "url": "https://www.google.com"
  }'
```

## Acknowledgements

- This project uses [Fastify](https://www.fastify.io/)
- The PDF generation is done with [Playwright](https://playwright.dev/)
- The pdf controller is based on the work done in [losol/converto](https://github.com/losol/converto)
