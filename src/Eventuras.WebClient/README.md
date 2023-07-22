# Eventuras front end

This is the front end for Eventuras event management system.

## Getting Started

First, ensure the backend api is running.

If developing locally you could add ann `.env` file in the `src/Eventuras.WebFrontend` folder.

```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APPLICATION_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5666
AUTH0_DOMAIN=asdf.eu.auth0.com
AUTH0_CLIENT_ID=asdf
AUTH0_CLIENT_SECRET=asdf
AUTH0_API_AUDIENCE=https://eventuras/api
NEXTAUTH_SECRET=asdf
```

For production environment these variables should as environment variables.

To start dev serv

```bash
npx next dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
