using System;
using System.IO;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Eventuras.Services;
using Eventuras.Services.BackgroundJobs;
using Eventuras.Services.Constants;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Notifications;
using Eventuras.WebApi;
using Eventuras.WebApi.Auth;
using Eventuras.WebApi.Config;
using Eventuras.WebApi.Constants;
using Eventuras.WebApi.Extensions;
using Eventuras.WebApi.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog (reads from appsettings.json "Serilog" section)
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

// Configure Sentry (activates automatically when Sentry:Dsn is set)
builder.WebHost.UseSentry();

// Get configuration
var features = GetFeatureManagement(builder.Configuration);
var appSettings = GetAppSettings(builder.Configuration);

// Configure JSON serializer options shared by MVC and the OpenAPI schema generator.
// Microsoft.AspNetCore.OpenApi reads the Minimal API JSON options (ConfigureHttpJsonOptions),
// not MVC's. Mirroring the converters in both keeps runtime serialization and the
// generated OpenAPI spec in sync — without this, the spec would emit enums as
// { "type": "integer" } even though the API serialises them as strings.
// See https://github.com/dotnet/aspnetcore/issues/61303
static void ConfigureJsonSerializer(System.Text.Json.JsonSerializerOptions options)
{
    options.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
    options.Converters.Add(new LocalDateConverter());
    options.Converters.Add(new JsonStringEnumConverter());
}

// Configure dependency injection container
builder.Services.AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
        options.Filters.Add<HttpResponseExceptionFilter>();
    })
    .AddJsonOptions(j => ConfigureJsonSerializer(j.JsonSerializerOptions));

builder.Services.ConfigureHttpJsonOptions(j => ConfigureJsonSerializer(j.SerializerOptions));

// Configure data protection if folder is set
if (!string.IsNullOrEmpty(appSettings.DataProtectionKeysFolder))
{
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(appSettings.DataProtectionKeysFolder));
}


builder.Services.AddRazorPages();

// Skip EF configuration for IntegrationTests - tests will configure their own DbContext
if (!builder.Environment.IsEnvironment("IntegrationTests"))
{
    builder.Services.ConfigureEf();
}

builder.Services.ConfigureDbInitializationStrategy();
builder.Services.ConfigureAuthorizationPolicies(builder.Configuration);
builder.Services.AddEmailServices();
builder.Services.AddSmsServices();
builder.Services.AddInvoicingServices(builder.Configuration, features);
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddMemoryCache();
builder.Services.AddHealthChecks();
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("Auth"));

builder.Services.AddCors(options =>
{
    var origins =
        appSettings.AllowedOrigins.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

    options.AddDefaultPolicy(corsBuilder => corsBuilder
        .WithOrigins(origins)
        .AllowAnyHeader()
        .WithExposedHeaders(Api.OrganizationHeader, Api.CorrelationIdHeader)
        .AllowCredentials()
        .AllowAnyMethod());
});

var apiVersioningBuilder = builder.Services.AddApiVersioning(o =>
{
    o.ApiVersionReader = new UrlSegmentApiVersionReader();
    o.DefaultApiVersion = new ApiVersion(3, 0);
});

apiVersioningBuilder.AddApiExplorer(o =>
{
    o.GroupNameFormat = "'v'VVV";
    o.SubstituteApiVersionInUrl = true;
});


// Register background job queue and workers
builder.Services.AddSingleton<IBackgroundJobQueue, BackgroundJobQueue>();
builder.Services.AddHostedService<NotificationBackgroundWorker>();
builder.Services.AddHostedService<CertificateBackgroundWorker>();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearerConfiguration(builder.Configuration["Auth:Issuer"],
        builder.Configuration["Auth:Audience"],
        builder.Configuration["Auth:ClientSecret"]);

builder.Services.AddSingleton<IAuthorizationHandler, RequireScopeHandler>();

builder.Services.AddOpenApi("v3", options =>
{
    options.AddDocumentTransformer<AddSecuritySchemeTransformer>();
    options.AddOperationTransformer<AddOrganizationHeaderTransformer>();
    options.AddOperationTransformer<RemoveJsonPatchContentTypeTransformer>();
    options.AddSchemaTransformer<NodaTimeSchemaTransformer>();
});

// Finish configuring DI, logging and configuration
var app = builder.Build();

// Configure middleware pipeline — correlation ID first so all requests get it
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("IntegrationTests"))
{
    app.UseDeveloperExceptionPage();
}

// OpenAPI spec is always available (needed for SDK generation in CI)
app.MapOpenApi();

// API docs UI is opt-in via configuration
if (features.EnableApiDocs || app.Environment.IsDevelopment())
{
    app.MapScalarApiReference("docs", options =>
    {
        options.Title = "Eventuras API";
        options.OpenApiRoutePattern = "/openapi/v3.json";
    });
}

app.UseHttpsRedirection();
app.UseHsts();
app.UseCors();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Kubernetes liveness/readiness probe – excludes external dependency checks.
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => !check.Tags.Contains("converto"),
});

// Manual diagnostics endpoint – call this to verify Converto is reachable.
// Not used by Kubernetes probes. Requires AdministratorRole to prevent abuse.
app.MapHealthChecks("/health/converto", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("converto"),
}).RequireAuthorization(Auth.AdministratorRole);

// Seed database, run OnStartup builder.Services, etc.
await PreStartupRoutine(app);

// Start the server
await app.RunAsync();

return;

static FeatureManagement GetFeatureManagement(IConfiguration configuration)
{
    var settings = new FeatureManagement();
    configuration.GetSection("FeatureManagement").Bind(settings);

    return settings;
}

static AppSettings GetAppSettings(IConfiguration configuration)
{
    var settings = new AppSettings();
    configuration.GetSection("AppSettings").Bind(settings);

    return settings;
}

static async Task PreStartupRoutine(IHost host)
{
    await using var scope = host.Services.CreateAsyncScope();
    var services = scope.ServiceProvider;

    var startupServices = services.GetServices<IStartupService>();
    foreach (var startupService in startupServices)
    {
        startupService.OnStartup();
    }

    var initializer = services.GetRequiredService<IDbInitializer>();
    await initializer.SeedAsync();
}

public partial class Program
{
}
