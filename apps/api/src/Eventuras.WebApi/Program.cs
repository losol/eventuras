using System;
using System.IO;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Eventuras.Services;
using Eventuras.Services.Constants;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Notifications;
using Eventuras.WebApi;
using Eventuras.WebApi.Auth;
using Eventuras.WebApi.Config;
using Eventuras.WebApi.Extensions;
using Eventuras.WebApi.Filters;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.InMemory;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.FeatureManagement;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;

var builder = WebApplication.CreateBuilder(args);

// Get configuration
var features = GetFeatureManagement(builder.Configuration);
var appSettings = GetAppSettings(builder.Configuration);

// Configure Sentry
if (features.UseSentry) { builder.WebHost.UseSentry(); }

// Configure dependency injection container
builder.Services.AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
        options.Filters.Add<HttpResponseExceptionFilter>();
    })
    .AddJsonOptions(j =>
    {
        j.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        j.JsonSerializerOptions.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
        j.JsonSerializerOptions.Converters.Add(new LocalDateConverter());
        j.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Configure data protection if folder is set
if (!string.IsNullOrEmpty(appSettings.DataProtectionKeysFolder))
{
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(appSettings.DataProtectionKeysFolder));
}


builder.Services.AddRazorPages();
builder.Services.ConfigureEf();
builder.Services.ConfigureDbInitializationStrategy(builder.Configuration);
builder.Services.ConfigureAuthorizationPolicies(builder.Configuration);
builder.Services.AddEmailServices();
builder.Services.AddSmsServices();
builder.Services.AddInvoicingServices(builder.Configuration, features);
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddFeatureManagement();
builder.Services.AddMemoryCache();
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("Auth"));

builder.Services.AddCors(options =>
{
    var origins =
        appSettings.AllowedOrigins.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

    options.AddDefaultPolicy(corsBuilder => corsBuilder
        .WithOrigins(origins)
        .AllowAnyHeader()
        .WithExposedHeaders(Api.OrganizationHeader)
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


builder.Services.ConfigureIdentity();

builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseInMemoryStorage(new InMemoryStorageOptions { MaxExpirationTime = TimeSpan.FromHours(24) })
);


builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 2;
    options.Queues = new[] { "notifications_queue", "certificates_queue" };
});

builder.Services.AddScoped<NotificationBackgroundService>();

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

builder.Services.AddSwaggerGen();
builder.Services.ConfigureOptions<ConfigureSwaggerOptions>();

// Finish configuring DI, logging and configuration
var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("IntegrationTests"))
{
    var apiVersions = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        foreach (var description in apiVersions.ApiVersionDescriptions)
        {
            c.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json",
                description.GroupName.ToLowerInvariant());
        }
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

app.UseHangfireDashboard("/jobs", new DashboardOptions { IsReadOnlyFunc = (DashboardContext context) => true });

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
