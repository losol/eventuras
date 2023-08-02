# Eventuras front end

This is the front end for Eventuras event management system.

## Getting Started

First, ensure the backend api is running.

If developing locally you could add ann `.env` file in the `src/Eventuras.WebFrontend` folder.

```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APPLICATION_URL=http://localhost:3000
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_API_AUDIENCE=https://eventuras/api
API_BASE_URL=http://localhost:5100
NEXTAUTH_SECRET=
NEXT_PUBLIC_ORGANIZATION_ID=test
```

For production environment these variables should as environment variables.

To start dev serv

```bash
npx next dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Precommit hook

In package.json there is a lint-staged section which shows all the actions taken on staged files.
Unfortunately tsc ignores tsconfig (see why section of https://github.com/gustavopch/tsc-files). So we use tsc-files to do these checks. Unfortunately it generates tsconfig.\*.tsbuildinfo files, but these should be automatically removed.

## Code style

We are open to most standards, as long as there is one. We were inspired by [joshchus setup](https://dev.to/joshchu/how-to-setup-prettier-eslint-husky-and-lint-staged-with-a-nextjs-and-typescript-project-i7b)
