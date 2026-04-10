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

- **Language**: C# (.NET 10)
- **Framework**: ASP.NET Core
- **Database**: PostgreSQL
- **ORM**: Npgsql / EF Core
- **Authentication**: OAuth 2.0 / OpenID Connect
- **API Documentation**: Scalar / OpenAPI

## Prerequisites

Before you can run the API locally, ensure you have the following installed:

- [.NET 10 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
- [PostgreSQL 18 or later](https://www.postgresql.org/download/) — required because migrations use the built-in `uuidv7()` function added in PostgreSQL 18
- An Identity Provider (IdP) that supports OAuth 2.0 / OpenID Connect
  - The project is configured to use [Auth0](https://auth0.com/) by default
  - Any OIDC-compliant provider can be used (e.g., Azure AD, Keycloak, IdentityServer)

## Getting Started

### Quick Start with Aspire (recommended)

The fastest way to get started is with .NET Aspire, which orchestrates PostgreSQL and the API with a single command:

```bash
dotnet run --project src/Eventuras.AppHost
```

This will:

- Start a PostgreSQL container with a pre-configured `eventuras` database
- Start the API with the connection string automatically injected
- Open the **Aspire Dashboard** where you can inspect logs, traces, and metrics in real time

You still need to configure an identity provider (see below), but the database setup is handled for you.

### Manual Setup

If you prefer to manage PostgreSQL yourself, follow the steps below.

#### Set Up PostgreSQL Database

The easiest way would be to use a docker compose file, for example from the `losol/dockers` [repo](https://github.com/losol/dockers/tree/master/postgres).

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

#### Apply Database Migrations

Run Entity Framework migrations to set up the database schema:

```bash
dotnet ef database update --project src/Eventuras.WebApi
```

#### Run the API

Start the development server:

```bash
dotnet run --project src/Eventuras.WebApi
```

### Set up identity provider

Set environment variables for identity provider details, or set user-secrets for local development. You should at least set the following: `Auth:ClientId`, `Auth:ClientSecret`, `Auth:Issuer`, and `Auth:ApiIdentifier`.

Example using dotnet user-secrets:

```bash
dotnet user-secrets set "Auth:ClientId" "your-client-id" --project src/Eventuras.WebApi
dotnet user-secrets set "Auth:ClientSecret" "your-client-secret" --project src/Eventuras.WebApi
dotnet user-secrets set "Auth:Issuer" "https://your-tenant.auth0.com/" --project src/Eventuras.WebApi
dotnet user-secrets set "Auth:ApiIdentifier" "your-api-id" --project src/Eventuras.WebApi
```

### Optional: Use ConvertoAPI for PDF generation

If you want to use ConvertoAPI for PDF generation, set `Converto:ClientId`, `Converto:ClientSecret`, `Converto:PdfEndpointUrl`, and `Converto:TokenEndpointUrl`.

### Endpoints

The API will be available at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`
- **API Docs**: `http://localhost:5000/docs` (enabled in Development, or via `FeatureManagement:EnableApiDocs`)
- **Integration tests**: `https://localhost:5002`
- **Aspire Dashboard**: Shown in terminal output when running via AppHost


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

Generate idempotent SQL script (for manual or CI/CD deployments):
```bash
cd src/Eventuras.Infrastructure
dotnet ef migrations script --idempotent \
  -o sqlscript/database-migrations.sql \
  --startup-project ../Eventuras.WebApi
```

### API Documentation

Once the application is running, you can explore the API documentation at:
- API Docs: `https://localhost:5001/docs`
- OpenAPI JSON: `https://localhost:5001/openapi/v3.json`

API docs are enabled by default in Development. In other environments, set `FeatureManagement:EnableApiDocs` to `true`.

## Observability

The API uses OpenTelemetry (via the ServiceDefaults project) to emit traces, metrics, and structured logs. During local development these are visible in the Aspire Dashboard. In production you can export the same telemetry to your Grafana stack.

### Exporting to Grafana (Prometheus / Loki / Tempo)

Set the `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable to point at an OpenTelemetry Collector or Grafana Alloy instance:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy.internal:4317
```

The collector/Alloy then forwards:

- **Metrics** to Prometheus (for Grafana dashboards)
- **Traces** to Tempo (for distributed tracing)
- **Logs** to Loki (for log aggregation)

Example Alloy receiver config:

```alloy
otelcol.receiver.otlp "default" {
  grpc { endpoint = "0.0.0.0:4317" }
  http { endpoint = "0.0.0.0:4318" }

  output {
    metrics = [otelcol.exporter.prometheus.default.input]
    traces  = [otelcol.exporter.otlp.tempo.input]
    logs    = [otelcol.exporter.loki.default.input]
  }
}
```

When running via the AppHost locally, `OTEL_EXPORTER_OTLP_ENDPOINT` is set automatically to point at the Aspire Dashboard. No extra config is needed for local development.

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
