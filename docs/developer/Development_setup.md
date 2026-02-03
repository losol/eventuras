# Setting up development environment

## Prerequisites

Backend:

-   .Net 8.0 SDK
-   PostgreSQL

Frontend:

-   Node.js

## Setting up the backend

### Database

Create a database for eventuras, the default name is `eventuras`. Add the default user `eventuras` with password `Str0ng!PaSsw0rd`, or make your own - remember to update the connection string in appsettings.

### Seed the system admin

The database is seeded with admin user on the first run of the `Eventuras.WebApi` project. The default credentials are email `admin@email.com` with password `Str0ng!PaSsw0rd`.

### Run the classic project to edit events

For now all events are created in the classic project. Run the `Eventuras.Web` project and login in with the system admin user to create events. The admin functionality is available in the top navbar after logging in with the system admin user. This is only available in norwegian.

### Set up email sending

Each organisation needs to have en email service. Take a look in [Email setup](./Email.md) for more information.

## Setting up the new frontend

### Install dependencies

Install dependencies with `npm install` in the `Eventuras.WebFrontend` folder.

### Configure environment variables

Add an `.env` file in the `Eventuras.WebFrontend` folder. Example file below.

```env
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_APPLICATION_URL=http://localhost:3000
AUTH0_DOMAIN=https://eventuras.eu.auth0.com
AUTH0_CLIENT_ID=xxxxxx
AUTH0_CLIENT_SECRET=xxxxx
AUTH0_API_AUDIENCE=https://eventuras/api
NEXTAUTH_SECRET=xxxxx
```

### Run the frontend

Run the frontend with `npx next dev` in the `Eventuras.WebFrontend` folder.

Partner developers may get access to admin part of the demosite as well. See [Demo site](./Demo_site.md) for more information.

