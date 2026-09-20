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
- [Docker](https://www.docker.com/) — for the containers the Aspire AppHost starts
- An Identity Provider (IdP) that supports OAuth 2.0 / OpenID Connect
  - The Aspire AppHost brings one up for you; the rest of this list only applies to a manual setup
  - Deployed environments use [Keycloak](https://www.keycloak.org/); any OIDC-compliant provider can be used

## Getting Started

### Quick Start with Aspire (recommended)

.NET Aspire orchestrates the whole stack — database, identity provider, mail and
both apps — with a single command:

```bash
dotnet run --project src/Eventuras.AppHost
```

This will:

- Start a PostgreSQL container with a pre-configured `eventuras` database
- Apply migrations and seed reference data (payment methods and a first organization) as a separate step, before the API starts
- Start the API with the connection string automatically injected
- Start **Keycloak** (`ghcr.io/losol/tessera-idp`) with the development realm imported
- Start **Mailpit**, where the login codes and the API's own mail are delivered
- Start the **web app**, with its API and issuer URLs injected
- Start **Traefik**, fronting all of the above on `https://*.dev.localhost`
- Open the **Aspire Dashboard** where you can inspect logs, traces, and metrics in real time

Everything is reached through Traefik, on hostnames rather than ports:

| Service | URL | Direct (bypasses the proxy) |
| --- | --- | --- |
| Web | <https://eventuras-web.dev.localhost> | <http://localhost:5100> |
| API | <https://eventuras-api.dev.localhost> | <http://localhost:5101> |
| Keycloak | <https://eventuras-id.dev.localhost> (realm `eventuras-dev`, admin `admin` / `admin`) | — |
| Mailpit | <https://eventuras-mail.dev.localhost> | <http://localhost:5103> |

Deployed environments sit behind Traefik, so development does too. That is not
cosmetic: Keycloak derives issuer and redirect URLs from forwarded headers, and
getting that wrong is invisible until it breaks in staging. Keycloak is therefore
reachable *only* through the proxy, so there is one canonical issuer URL.

`*.dev.localhost` resolves to loopback without a hosts file, and the development
certificate already covers that suffix — so the browser, Node and .NET all trust
it with no extra setup. TLS ends at Traefik; the hop to Keycloak is plain http,
exactly as in a cluster.

Log in as **`admin@example.com`**. Login is passwordless — the same email plus
one-time code flow that staging runs — so the code arrives in Mailpit.

#### Mail from the API

The API's receipts and notifications land in Mailpit too, so a registration can be
followed all the way to the message it produces. Two things make that work, and both
are set up for you: Mailpit serves STARTTLS with the development certificate, because
the API's SMTP sender always requires it, and the migration step points the first
organization's SMTP settings at Mailpit. The API reads SMTP from organization settings
rather than configuration, so without those rows it refuses to send at all. Deployments
pass none of this and nothing is written.

No identity provider setup is needed: everything the realm needs is in
`src/Eventuras.AppHost/realms/eventuras-dev-realm.json`, which is the single
source of truth for it. Keycloak runs without a data volume on purpose, so the
realm is re-imported on every start and cannot drift into a container nobody can
reproduce. Anything you need on every run belongs in that file.

The realm's client secret and admin password are development fixtures for a
localhost-only realm, deliberately committed so the setup is reproducible. Never
import that realm into a deployed Keycloak.

#### TLS for the development Keycloak

The web app's OIDC client refuses a plain-http issuer and the API validates the
issuer's metadata over TLS, so Keycloak has to serve HTTPS locally. The AppHost
exports the **ASP.NET Core development certificate** to `.certs/` (gitignored) on
first run, because it is the one certificate a .NET machine already trusts. If
the export fails, run this once:

```bash
dotnet dev-certs https --trust
```

The `*.dev.localhost` names are only in certificates created by the .NET 10 SDK. A
certificate from an older SDK covers `localhost` alone and has to be regenerated
with `dotnet dev-certs https --clean`, then the trust command above.

Node does not read the OS trust store, so the AppHost passes the same certificate
to the web app via `NODE_EXTRA_CA_CERTS`. Running `pnpm dev` by hand needs that
variable set too — see `apps/web/.env-template`.

#### Running the end-to-end tests against it

The Playwright suite drives the same login flow, and reads the code from Mailpit.
The session secret is read from `apps/web/.env`, and Node needs the exported
certificate to reach the stack over HTTPS:

```bash
cd ../../tests/e2e
NODE_EXTRA_CA_CERTS=../../apps/api/src/Eventuras.AppHost/.certs/kc.pem \
  E2E_WEB_URL=https://eventuras-web.dev.localhost E2E_API_URL=http://localhost:5101 \
  E2E_ADMIN_EMAIL=admin@example.com E2E_SYSTEMADMIN_EMAIL=admin@example.com \
  E2E_OTP_SOURCE=mailpit E2E_MAILPIT_API_URL=http://localhost:5103 \
  pnpm test
```

#### If `https://*.dev.localhost` resets the connection

Docker Desktop can keep a stale forward for port 443 when a restart of the
AppHost recreates the Traefik container: TCP connects, then every TLS handshake
is reset, while the stack is otherwise healthy. Restarting the proxy registers
the forward again:

```bash
aspire resource traefik restart
```

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
