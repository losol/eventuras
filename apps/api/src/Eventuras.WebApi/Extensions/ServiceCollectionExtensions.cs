using System;
using System.Linq;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.Services.Converto;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Email;
using Eventuras.Services.PowerOffice;
using Eventuras.Services.SendGrid;
using Eventuras.Services.Sms;
using Eventuras.Services.Smtp;
using Eventuras.Services.Stripe;
using Eventuras.Services.Twilio;
using Eventuras.WebApi.Auth;
using Eventuras.WebApi.Config;
using Losol.Communication.Email.HealthCheck;
using Losol.Communication.HealthCheck.Abstractions;
using Losol.Communication.HealthCheck.Email;
using Losol.Communication.HealthCheck.Sms;
using Losol.Communication.Sms.HealthCheck;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Eventuras.WebApi.Extensions;

public static class ServiceCollectionExtensions
{
    public static void ConfigureEf(this IServiceCollection services) =>
        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var connectionString = sp.GetRequiredService<IConfiguration>().GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new ArgumentException("Connection string is not set");
            }

            var env = sp.GetRequiredService<IHostEnvironment>();
            var isDevelopment = env.IsDevelopment() || env.IsEnvironment("IntegrationTests");

            options.UseNpgsql(connectionString, o =>
                {
                    o.UseNodaTime();
                    o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                })
                .EnableSensitiveDataLogging(isDevelopment)
                .EnableDetailedErrors(isDevelopment)
                .ConfigureWarnings(warns =>
                {
                    if (isDevelopment)
                    {
                        warns.Ignore(CoreEventId.SensitiveDataLoggingEnabledWarning);
                    }
                });
        });

    public static void ConfigureIdentity(
        this IServiceCollection services) =>
        services.AddIdentity<ApplicationUser, IdentityRole>(config =>
            {
                config.User.RequireUniqueEmail = true;
            }).AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

    public static void ConfigureAuthorizationPolicies(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddScoped<IClaimsTransformation, DbUserClaimTransformation>();
        services.AddAuthorization(options =>
        {
            var apiScopes = config.GetSection("Auth:Scopes")
                .GetChildren()
                .Select(s => s.Value)
                .ToArray();

            var adminRoles = new[] { Roles.Admin, Roles.SuperAdmin, Roles.SystemAdmin };
            options.AddPolicy(Constants.Auth.AdministratorRole, policy => policy.RequireRole(adminRoles));

            Array.ForEach(apiScopes, apiScope =>
                options.AddPolicy(apiScope,
                    policy => policy.Requirements.Add(
                        new ScopeRequirement(config["Auth:Issuer"], apiScope)
                    )
                )
            );
        });
    }

    public static void ConfigureDbInitializationStrategy(this IServiceCollection services,
        IConfiguration config)
    {
        services.Configure<DbInitializerOptions>(config);
        services.AddScoped<IDbInitializer, DbInitializer>();
    }

    public static void AddEmailServices(this IServiceCollection services)
    {
        services.AddConfigurableEmailServices();
        services.AddConfigurableSmtpServices();
        services.AddConfigurableSendGridServices();
    }

    public static void AddSmsServices(this IServiceCollection services)
    {
        services.AddConfigurableSmsServices();
        services.AddConfigurableTwilioServices();
    }

    public static void AddInvoicingServices(
        this IServiceCollection services,
        IConfiguration config,
        FeatureManagement features)
    {
        if (features.UsePowerOffice)
        {
            services.AddPowerOffice(config.GetSection("PowerOffice"));
        }

        if (features.UseStripeInvoice)
        {
            services.AddStripe(config.GetSection("Stripe"));
        }
    }

    public static void AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register our application services
        services.AddCoreServices();

        // Add Health Checks
        services.AddApplicationHealthChecks(
            configuration.GetSection(Constants.HealthChecks.HealthCheckConfigurationKey));

        // for cert PDF rendering
        services.AddHttpContextAccessor();
        services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
        services.AddHttpClient();
        services.AddConvertoServices(configuration.GetSection("Converto"));
    }

    public static void AddApplicationHealthChecks(this IServiceCollection services, IConfigurationSection configuration)
    {
        services.AddSingleton<IHealthCheckStorage, HealthCheckMemoryStorage>(); // store health information in memory.

        if (!configuration.HealthChecksEnabled())
        {
            return;
        }

        services.Configure<EmailHealthCheckSettings>(configuration.GetSection("Email"));
        services.Configure<SmsHealthCheckSettings>(configuration.GetSection("Sms"));

        services.AddHealthChecks()
            .AddCheck<EmailHealthCheck>("email")
            .AddCheck<SmsHealthCheck>("sms");

        var baseUri = configuration.GetValue<Uri>("BaseUri");
        var healthEndpoint = new Uri(baseUri, Constants.HealthChecks.HealthCheckUri);

        services
            .AddHealthChecksUI(settings =>
                settings.AddHealthCheckEndpoint(Constants.HealthChecks.HealthCheckName, healthEndpoint.ToString()))
            .AddInMemoryStorage();
    }
}
