# Eventuras API

The backend API for Eventuras - a comprehensive platform for knowledge managent, courses, events, and conferences. 

## Purpose

This API serves as the core backend service for the Eventuras platform, providing:

- Event and course management
- User registration and participant management
- Payment processing
- Organization management
- Certificate generation
- Email notifications

## Tech Stack

- **Language**: C# (.NET 8+) - intends to be at the latest .NET LTS version within 3 months of a new stable LTS version.
- **Framework**: ASP.NET Core
- **Database**: PostgreSQL
- **ORM**: Npsql / EF Core 
- **Authentication**: OAuth 2.0 / OpenID Connect (configured with Auth0, but any OIDC provider can be used)
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

Before you can run the API locally, ensure you have the following installed:

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) 
- [PostgreSQL](https://www.postgresql.org/download/) (version 12 or later recommended)
- An Identity Provider (IdP) that supports OAuth 2.0 / OpenID Connect
  - The project is configured to use [Auth0](https://auth0.com/) by default
  - Any OIDC-compliant provider can be used (e.g., Azure AD, Keycloak, IdentityServer)

## Getting Started

### Set Up PostgreSQL Database

The easiest way would be to use an docker compose file, for example from the `losol/dockers` [repo](https://github.com/losol/dockers/tree/master/postgres).

Create a new PostgreSQL database for the project, and assign a user with permissions to use the database.

Set the environment variable for the connection string, or use dotnet user-secrets for local development.

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=eventuras;Username=pguser;Password=pgpwd" --project src/Eventuras.WebApi
```

If using Azure PostgreSQL, the connection string would look something like this:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=SERVER_NAME.postgres.database.azure.com;Database=DATABASE_NAME;Port=5432;User Id=DATABASE_USERNAME;Password=DATABASE_PASSWORD;Ssl Mode=Require;Trust Server Certificate=True" --project src/Eventuras.WebApi
```

Remember to open the necessary firewall rules to allow your local machine to connect to the Azure PostgreSQL instance.

### Set up identity provider

Set Environment variables for identy provider detais, or set user-secrets for local development. You should at least set  the following: `Auth:ClientId`, `Auth:ClientSecret`, `Auth:Issuer`, and `Auth:ApiIdentifier`.

Example using dotnet user-secrets:

```bash
dotnet user-secrets set "Auth:ClientId" "your-client-id" --project src/Eventuras.WebApi
dotnet user-secrets set "Auth:ClientSecret" "your-client-secret" --project src/Eventuras.WebApi
dotnet user-secrets set "Auth:Issuer" "https://your-tenant.auth0.com/" --project src/Eventuras.WebApi
dotnet user-secrets set "Auth:ApiIdentifier" "your-api-id" --project src/Eventuras.WebApi
```


### Apply Database Migrations

Run Entity Framework migrations to set up the database schema:

```bash
dotnet ef database update --project src/Eventuras.WebApi
```

### Optional: Use ConvertoAPI for pdf generation

If you want to use ConvertoAPI for PDF generation, set `Converto:ClientId`, `Converto:ClientSecret`, `Converto:PdfEndpointUrl`, and `Converto:TokenEndpointUrl`.


### Run the API

Start the development server:

```bash
dotnet run --project src/Eventuras.WebApi
```

The API will be available at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`
- **Swagger UI**: `http://localhost:5000/swagger` - only available if ASPNETCORE_ENVIRONMENT=Development
- **Integration tests**: `https://localhost:5002`


## Development

### Running Tests

```bash
dotnet test
```

### Database Migrations

Create a new migration:
```bash
dotnet ef migrations add MigrationName
```

Apply migrations:
```bash
dotnet ef database update
```

Rollback to a specific migration:
```bash
dotnet ef database update PreviousMigrationName
```

### API Documentation

Once the application is running, you can explore the API documentation at:
- Swagger UI: `https://localhost:5001/swagger`
- OpenAPI JSON: `https://localhost:5001/swagger/v3/swagger.json`

## Project Structure

```
├── Controllers/         # API endpoints
├── Models/             # Domain models - should only be used for technical models, not business models
├── Services/           # Business logic
├── Infrastructure/     # Database context and configurations
├── Migrations/         # EF Core migrations
└── appsettings.json    # Configuration files
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
