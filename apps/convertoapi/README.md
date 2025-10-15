# ConvertoAPI pdf generator

## Installation

`pnpm install` as usual. But you might need to install playwright dependencies with
`npx playwright install`.

Copy `.env.template` to `.env` and fill in the values.

Then you may run the app with `npm run dev`.

## Run local

To run converto api locally with docker, you can use the following command:

```bash
docker run -d --name converto_api \
  -e HOST=0.0.0.0 \
  -e BASE_URL=http://localhost \
  -e PORT=3100 \
  -e JWT_SECRET=jwt_secret \
  -e CLIENT_ID=client_id \
  -e CLIENT_SECRET=client_secret \
  -p 3100:3100 \
  losolio/converto-api
```

## Usage

### Get a token

Token Endpoint Authentication Method is client_secret_post. Clients can authenticate to the /token endpoint using the client_secret_post method, where the client_id and client_secret are included in the request body as URL-encoded form parameters. This method is recommended for server-side clients where the client secret can be securely stored.

```bash
curl --request POST \
  --url http://localhost:3100/token \
  --header "Authorization: Basic $(echo -n 'client_id:client_secret' | base64)" \
  --header "Content-Type: application/json" \
  --data '{
    "grant_type": "client_credentials"
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
  }' \
  --output generated.pdf
```

## Acknowledgements

- This project uses [Fastify](https://www.fastify.io/)
- The PDF generation is done with [Playwright](https://playwright.dev/)
- The pdf controller is based on the work done in [losol/converto](https://github.com/losol/converto)
