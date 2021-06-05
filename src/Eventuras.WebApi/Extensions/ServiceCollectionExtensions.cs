using System;
using System.Linq;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Invoicing;
using Eventuras.Services.TalentLms;
using Eventuras.Services.Zoom;
using Eventuras.WebApi.Auth;
using Eventuras.WebApi.Config;
using Losol.Communication.Email.File;
using Losol.Communication.Email.Mock;
using Losol.Communication.Email.SendGrid;
using Losol.Communication.Email.Smtp;
using Losol.Communication.HealthCheck.Abstractions;
using Losol.Communication.HealthCheck.Email;
using Losol.Communication.HealthCheck.Sms;
using Losol.Communication.Sms.Mock;
using Losol.Communication.Sms.Twilio;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Eventuras.WebApi.Extensions
{
    public static class ServiceCollectionExtensions
    {

        public static void ConfigureEF(
            this IServiceCollection services,
            IConfiguration config,
            IWebHostEnvironment env)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options
                    .UseNpgsql(config.GetConnectionString("DefaultConnection"))
                    .EnableSensitiveDataLogging(env.IsDevelopment());
            });
        }

        public static void ConfigureIdentity(
            this IServiceCollection services)
        {
            services.AddIdentity<ApplicationUser, IdentityRole>(config =>
            {
                config.User.RequireUniqueEmail = true;
            }).AddEntityFrameworkStores<ApplicationDbContext>()
              .AddDefaultTokenProviders();
        }

        public static void ConfigureAuthorizationPolicies(
            this IServiceCollection services,
            IConfiguration config)
        {
            services.AddAuthorization(options =>
            {
                var apiScopes = config.GetSection("Auth:Scopes")
                    .GetChildren()
                    .Select(s => s.Value)
                    .ToArray();

                var adminRoles = new string[] { Roles.Admin, Roles.SuperAdmin, Roles.SystemAdmin };
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
            IConfiguration config,
            IWebHostEnvironment hostingEnv)
        {
            services.Configure<DbInitializerOptions>(config);
            switch (hostingEnv)
            {
                case var env when env.IsProduction():
                    services.AddScoped<IDbInitializer, ProductionDbInitializer>();
                    break;
                case var env when env.IsDevelopment():
                    services.AddScoped<IDbInitializer, DevelopmentDbInitializer>();
                    break;
                default:
                    services.AddScoped<IDbInitializer, DefaultDbInitializer>();
                    break;
            }
        }

        public static void AddEmailServices(this IServiceCollection services,
            EmailProvider provider, IConfiguration Configuration)
        {
            // Register the correct email provider depending on the config
            switch (provider)
            {
                case EmailProvider.SendGrid:
                    services.AddSendGridEmailServices(Configuration.GetSection("SendGrid"));
                    break;
                case EmailProvider.Smtp:
                    services.AddSmtpEmailServices(Configuration.GetSection("Smtp"));
                    break;
                case EmailProvider.File:
                    services.AddFileEmailServices(Configuration.GetSection("Files"));
                    break;
                case EmailProvider.Mock:
                    services.AddMockEmailServices();
                    break;
            }

        }

        public static void AddSmsServices(
            this IServiceCollection services,
            SmsProvider provider,
            IConfiguration config)
        {
            switch (provider)
            {
                case SmsProvider.Twilio:
                    services.AddTwilioSmsServices(config.GetSection("Twilio"));
                    break;
                case SmsProvider.Mock:
                    services.AddMockSmsServices();
                    break;
            }
        }

        public static void AddInvoicingServices(
                this IServiceCollection services,
                IConfiguration config,
                FeatureManagement features)
        {
            // Register PowerOffice
            if (features.UsePowerOffice)
            {
                services.Configure<PowerOfficeOptions>(config.GetSection("PowerOffice"));
                services.AddScoped<IPowerOfficeService, PowerOfficeService>();
            }
            else
            {
                services.AddTransient<IPowerOfficeService, MockInvoicingService>();
            }
            if (features.UseStripeInvoice)
            {
                var stripeConfig = config.GetSection("Stripe").Get<StripeOptions>();
                StripeInvoicingService.Configure(stripeConfig.SecretKey);
                services.AddScoped<IStripeInvoiceService, StripeInvoicingService>();
            }
            else
            {
                services.AddTransient<IStripeInvoiceService, MockInvoicingService>();
            }
        }

        public static void AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register our application services
            services.AddCoreServices();

            // Add TalentLms integration if enabled in settings.
            services.AddTalentLmsIfEnabled(configuration.GetSection("TalentLms"));

            // Add Zoom external services if enabled in settings.
            services.AddZoomIfEnabled(configuration.GetSection("Zoom"));

            // Add Health Checks
            services.AddApplicationHealthChecks(configuration.GetSection(Constants.HealthChecks.HealthCheckConfigurationKey));

            // Added for the renderpage service
            /* 
            services.AddHttpContextAccessor();
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddConvertoServices(configuration.GetSection("Converto"));
            // services.AddTransient<CertificatePdfRenderer>();
            services.AddHttpClient();
            */
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

            var baseUri = configuration.GetValue<string>("BaseUri")?.TrimEnd('/') ?? "";

            services
                .AddHealthChecksUI(settings =>
                {
                    settings
                        .AddHealthCheckEndpoint(Constants.HealthChecks.HealthCheckName, $"{baseUri}{Constants.HealthChecks.HealthCheckUri}");
                })
                .AddInMemoryStorage();
        }
    }
}


