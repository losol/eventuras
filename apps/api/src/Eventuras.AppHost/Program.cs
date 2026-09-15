using Eventuras.AppHost;

var builder = DistributedApplication.CreateBuilder(args);

// Pinned rather than generated: Postgres only applies a password when the data
// volume is first initialised, so a per-run password locks the AppHost out of
// its own volume on every subsequent start.
var postgresPassword = builder.AddParameter("postgres-password", "eventuras", secret: true);

var postgres = builder.AddPostgres("postgres", password: postgresPassword)
    .WithDataVolume();

// Aspire registers the database name but does not create it, so on a fresh
// volume the resource never reports healthy and everything waiting on it stalls.
var db = postgres.AddDatabase("DefaultConnection", databaseName: "eventuras")
    .WithCreationScript("CREATE DATABASE \"eventuras\";");

// Login delivers a one-time code by mail, so development needs somewhere for
// that mail to land. Mailpit's web UI is where you read the code.
var mailpit = builder.AddContainer("mailpit", "axllent/mailpit", "v1.27")
    // Named so the realm's smtpServer host resolves to it on the shared network.
    .WithContainerName("eventuras-mailpit")
    // Host ports only; Keycloak reaches the SMTP port over the container network.
    .WithHttpEndpoint(port: 5103, targetPort: 8025, name: "ui")
    .WithEndpoint(port: 5104, targetPort: 1025, name: "smtp");

// The Losol Keycloak distribution, not stock Keycloak: it carries the tessera-otp
// authenticator and the ratio login theme that staging and the e2e suite use, so
// development exercises the real login flow rather than a password stand-in.
const int keycloakPort = 5102;
var keycloakIssuer = $"https://localhost:{keycloakPort}/realms/eventuras-dev";

var certificates = DevCertificate.Export(builder.AppHostDirectory);

var keycloak = builder.AddContainer("keycloak", "ghcr.io/losol/tessera-idp", "0.1.1")
    .WithHttpsEndpoint(port: keycloakPort, targetPort: keycloakPort, name: "https")
    .WithBindMount(certificates, "/certs", isReadOnly: true)
    .WithBindMount("realms", "/opt/keycloak/data/import", isReadOnly: true)
    .WithEnvironment("KC_BOOTSTRAP_ADMIN_USERNAME", "admin")
    .WithEnvironment("KC_BOOTSTRAP_ADMIN_PASSWORD", "admin")
    // `start-dev` always enables HTTP, so KC_HTTP_ENABLED=false is a no-op here.
    // Only the TLS endpoint is published, so the plain listener stays unreachable.
    .WithEnvironment("KC_HTTPS_CERTIFICATE_FILE", "/certs/kc.pem")
    .WithEnvironment("KC_HTTPS_CERTIFICATE_KEY_FILE", "/certs/kc.key")
    // No data volume on purpose: realms/eventuras-dev-realm.json is the only source
    // of truth for the dev realm, so it cannot drift into a container nobody
    // can reproduce. Anything a developer needs on every run belongs in that file.
    .WithArgs("start-dev", "--import-realm", $"--https-port={keycloakPort}")
    .WaitFor(mailpit);

// Schema comes up as its own step, the way a deployment does it, so the API only
// ever starts against a database that is already current.
var migrations = builder.AddProject<Projects.Eventuras_MigrationService>("migrations")
    .WithReference(db)
    .WaitFor(db);

builder.AddProject<Projects.Eventuras_WebApi>("api")
    // Pinned for the same reason as Keycloak: apps/web reads BACKEND_URL from a
    // static .env, so the API cannot sit on a port Aspire picks per run.
    .WithHttpEndpoint(port: 5101, name: "http")
    .WithReference(db)
    .WaitForCompletion(migrations)
    .WaitFor(keycloak)
    // appsettings.json points at Auth0; development overrides it to the local realm.
    // Only what the API actually reads: Keycloak signs RS256, so the signing key
    // comes from the issuer's JWKS and no client credentials are involved.
    .WithEnvironment("Auth__Issuer", keycloakIssuer)
    .WithEnvironment("Auth__Audience", "eventuras-api")
    // Keycloak emits realm roles as a flat "roles" claim; without this the API
    // falls back to Auth0's inbound claim mapping and finds no roles at all.
    .WithEnvironment("Auth__RoleClaimType", "roles");

// The web app, so the whole stack is one command. Aspire owns the wiring that
// otherwise drifts in apps/web/.env — the API and issuer URLs, and the CA that
// makes Node trust the development Keycloak. Secrets stay in .env; see
// apps/web/.env-template. Running `pnpm dev` by hand still works.
builder.AddExecutable("web", "pnpm", "../../../web", "dev")
    // Port only, no targetPort: a proxied non-container endpoint cannot have both.
    .WithHttpEndpoint(port: 5100, env: "PORT")
    .WithEnvironment("APPLICATION_URL", "http://localhost:5100")
    .WithEnvironment("BACKEND_URL", "http://localhost:5101")
    .WithEnvironment("OIDC_ISSUER", keycloakIssuer)
    // Node does not read the OS trust store, so it needs the certificate that
    // Keycloak serves handed to it explicitly.
    .WithEnvironment("NODE_EXTRA_CA_CERTS", Path.Combine(certificates, "kc.pem"))
    .WaitFor(keycloak);

builder.Build().Run();
