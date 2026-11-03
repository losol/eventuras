# Backend rules (apps/api)

These describe what the code does today. Follow the existing code over generic .NET advice.

## Layout

- `Eventuras.WebApi`: controllers (`Controllers/v3/**`), DTOs (`Models`), auth, filters, `Program.cs`
- `Eventuras.Services`: business logic, one folder per area (`Events`, `Registrations`, `Orders`, `Privacy`, …)
- `Eventuras.Domain`: entities
- `Eventuras.Infrastructure`: `ApplicationDbContext`, EF migrations, `sqlscript/database-migrations.sql`
- `Eventuras.Services.*`: integrations (Stripe, PowerOffice, Twilio, SendGrid, Converto, …)
- `Eventuras.AppHost` / `Eventuras.ServiceDefaults` / `Eventuras.MigrationService`: Aspire

## Controllers

- `[ApiVersion("3")]`, `[Route("v{version:apiVersion}/<kebab-resource>")]`, `[ApiController]`, `[Produces("application/json")]`.
- Every action gets `[EndpointSummary]`, `[EndpointDescription]` and `[ProducesResponseType]`. They feed the committed OpenAPI doc.
- Keep controllers thin. Resolve the org with `ICurrentOrganizationAccessorService`, call a service and map to a DTO.
- Accept a `CancellationToken` and pass it on.

## Services and data

- Inject `ApplicationDbContext` directly. There is no repository layer, so don't add one.
- Use async EF calls throughout. Use `AsNoTracking()` for reads you won't modify.
- Throw service exceptions (`Eventuras.Services.Exceptions`). `HttpResponseExceptionFilter` maps them:
  `NotFoundException`→404, `NotAccessibleException`→403, `InputException`/`ArgumentServiceException`/`InvalidOperationServiceException`→400,
  `DuplicateException`→409, `OrgNotSpecifiedException`→400.
- Enforce access in the service, not only in the controller. SystemAdmin bypasses, and org Admins must be members of the resolved org.
- Expose `Uuid` (uuidv7) as the public identifier. Legacy int ids still exist internally.
- Record auditable changes with `IBusinessEventService.AddEvent(subject, eventType, message, organizationUuid, actorUserUuid, metadata)`.
  Don't store personal data in the message. Names are resolved at read time.
- Use NodaTime for domain dates and times (`LocalDate`, `Instant`, `SystemClock.Instance`). `DateTime` is only for technical timing.

## Migrations

1. `cd src/Eventuras.Infrastructure && dotnet ef migrations add <Name> -s ../Eventuras.WebApi/Eventuras.WebApi.csproj`
2. Regenerate the idempotent script (`MigrationsScriptTests` fails otherwise):
   `dotnet ef migrations script --idempotent -o sqlscript/database-migrations.sql --startup-project ../Eventuras.WebApi`
3. Migrations need PostgreSQL 18 (`uuidv7()`). Hand-written SQL in a migration must be safe to run on existing data.

## Tests

- Projects: `tests/Eventuras.UnitTests`, `tests/Eventuras.Services.Tests`, `tests/Eventuras.WebApi.Tests` (integration), and others.
- Integration tests use `CustomWebApiApplicationFactory<Program>` with the EF in-memory provider. No Postgres is needed.
- Seed data with the test scope helpers: `using var scope = _factory.Services.NewTestScope();`
  then `scope.CreateUserAsync()`, `scope.CreateEventAsync(...)`, `scope.CreateRegistrationAsync(...)`.
- Authenticate with `client.AuthenticatedAsSystemAdmin()`, `.AuthenticatedAsAdmin()`, `.AuthenticatedAs(user, roles)`.
- Assert with the helpers `response.CheckOk()`, `CheckCreated()`, `AsTokenAsync()`, and so on.
- Name tests `Should_<Expected_Behaviour>[_When_<Condition>]`, matching the existing files.
- Cover access control: anonymous, wrong org, admin and system admin.

## Before you hand over

- `dotnet format --verify-no-changes` (CI fails on formatting)
- `dotnet build`, and commit `docs/eventuras_v3.json` if it changed
- `dotnet test` for the affected projects
