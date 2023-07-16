# Eventuras - Event and Course Management Solution

![.NET Core CI](https://github.com/losol/eventuras/workflows/.NET%20Core%20CI/badge.svg)
![Docker Image CI](https://github.com/losol/eventuras/workflows/Docker%20Image%20CI/badge.svg)

Event and Course management solution.

## Get started

### Docker

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/).

```bash
# Clone the repository
git clone https://github.com/losol/eventuras.git
cd eventuras

# Build and run the application
docker-compose up
```

The application will now be live at `localhost:5100`.  
Use the following credentials to login:

```text
Username: admin@email.com
Password: Str0ng!PaSsw0rd
```

## Solution structure

The solution is structured as a monorepo with the following projects:

-   `Eventuras.Domain` - Domain models.
-   `Eventuras.Infrastructure` - Data access layer with support for PostgreSQL and Entity Framework Core.
-   `Eventuras.Services` - Business logic layer.
-   `Eventuras.Services.Auth0` - Auth0 integration.
-   `Eventuras.Services.Converto` - Integration with [Converto](https://github.com/losol/converto). Converto converts html to pdfs, and is used to generate certificates for event participants.
-   `Eventuras.Services.Google.RecaptchaV3` - Integration with Google Recaptcha V3. Will be deprecated.
-   `Eventuras.Services.PowerOffice` - Integration with [PowerOffice Go](https://www.poweroffice.com/no/go). PowerOffice Go is used for invoicing.
-   `Eventuras.Services.SendGrid` - Integration with [SendGrid](https://sendgrid.com/). SendGrid is used for sending emails. Will be deprecated.
-   `Eventuras.Services.Stripe` - Integration with [Stripe](https://stripe.com/). Stripe is not current in use, but is considered for reimplementation.
-   `Eventuras.Services.TalentLms` - Integration with [TalentLMS](https://www.talentlms.com/). TalentLMS integration was planned for automatic registering students at the Learning management system, but is not currently in use.
-   `Eventuras.Services.Twilio` - Integration with [Twilio](https://www.twilio.com/). Twilio is used for sending SMS.
-   `Eventuras.Services.Zoom` - Integration with [Zoom](https://zoom.us/). Zoom is used for onlie courses.
-   `Eventuras.Web` - ASP.NET Core application. This is the frontend application in current use. This project will be deprecated, and all UI functions should be replaced by `Eventuras.WebFrontend`.
-   `Eventuras.WebApi` - ASP.NET Core Web API application. This is the backend application which is production ready, and partly in use. This is the application which will serve API requests.
-   `Eventuras.WebFrontend` - React / Next.JS application. This is the frontend application which will replace `Eventuras.Web`. This application is currently under development.

