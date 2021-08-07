using Eventuras.Services.Auth0;
using Eventuras.Services.Converto;
using Eventuras.Services.TalentLms;
using Eventuras.Web.Config;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.Services.Auth;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Invoicing;
using Eventuras.Web;
using Eventuras.Web.Config;
using Eventuras.Web.Extensions;
using Eventuras.Web.Services;
using Losol.Communication.Email.File;
using Losol.Communication.Email.Mock;
using Losol.Communication.Email.SendGrid;
using Losol.Communication.Email.Smtp;
using Losol.Communication.Sms.Mock;
using Losol.Communication.Sms.Twilio;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using System.Globalization;
using System.Net.Http.Headers;
using Eventuras.Services.Organizations.Settings;
using Eventuras.Services.Zoom;
using Losol.Communication.HealthCheck.Abstractions;
using Losol.Communication.HealthCheck.Email;
using Losol.Communication.HealthCheck.Sms;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using DefaultAuthenticationService = Eventuras.Web.Services.DefaultAuthenticationService;

namespace Eventuras.Web.Extensions
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
                config.SignIn.RequireConfirmedEmail = true;
            }).AddEntityFrameworkStores<ApplicationDbContext>()
              .AddDefaultTokenProviders()
              .AddMagicLinkTokenProvider();

            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 7;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
            });
        }

        public static void ConfigureAuthorizationPolicies(
            this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy(AuthPolicies.AdministratorRole, policy => policy.RequireRole(Roles.Admin, Roles.SuperAdmin));
            });
        }

        public static void ConfigureMvc(
            this IServiceCollection services)
        {
            services
                .AddControllersWithViews(options =>
                    options.Filters.Add(new HttpResponseExceptionFilter())) // See https://docs.microsoft.com/en-us/aspnet/core/web-api/handle-errors?view=aspnetcore-5.0#use-exceptions-to-modify-the-response
                .AddNewtonsoftJson();

            services
                .AddRazorPages()
                .AddRazorPagesOptions(options =>
                {
                    options.Conventions.AuthorizeFolder("/Account/Manage");
                    options.Conventions.AuthorizePage("/Account/Logout");

                    options.Conventions.AuthorizeFolder("/Admin", AuthPolicies.AdministratorRole);
                    options.Conventions.AddPageRoute("/Events/Details", "events/{id}/{slug?}");

                    options.Conventions.AuthorizeFolder("/Profile");

                    options.Conventions.AddPageRoute("/Events/Register/Index", "events/{id}/{slug?}/register");
                })
                .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
                .AddRazorRuntimeCompilation();

            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
                // Only loopback proxies are allowed by default. Clear that restriction because forwarders are
                // being enabled by explicit configuration.
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            });
        }

        public static void ConfigureLocalization(this IServiceCollection services, CultureInfo defaultCultureInfo)
        {
            services.AddLocalization(options => options.ResourcesPath = "Resources");
            CultureInfo.DefaultThreadCurrentCulture = defaultCultureInfo;
            CultureInfo.DefaultThreadCurrentUICulture = defaultCultureInfo;
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

        public static void AddSiteConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            var siteConfig = Configuration.GetSection("Site").Get<Site>();
            services.AddSingleton(siteConfig);

            var socialConfig = Configuration.GetSection("Social").Get<Social>();
            services.AddSingleton(socialConfig);

            // TODO: Change to feature manager later
            var featureConfig = Configuration.GetSection("FeatureManagement").Get<FeatureManagement>();

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

            // Register email services
            services.AddTransient<StandardEmailSender>();
            services.AddTransient<MagicLinkSender>();
            services.AddTransient<RegistrationEmailSender>();
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
            AppSettings appsettings,
            IConfiguration config)
        {
            // Register PowerOffice
            if (appsettings.UsePowerOffice)
            {
                services.Configure<PowerOfficeOptions>(config.GetSection("PowerOffice"));
                services.AddSingleton<IOrganizationSettingsRegistryComponent, PowerOfficeSettingsRegistryComponent>();
                services.AddScoped<IPowerOfficeService, PowerOfficeService>();
            }
            else
            {
                services.AddTransient<IPowerOfficeService, MockInvoicingService>();
            }
            if (appsettings.UseStripeInvoice)
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

            // Add Page render Service
            services.AddScoped<IRenderService, ViewRenderService>();

            // Add default authentication handler (Razor Pages)
            services.TryAddTransient<IEventurasAuthenticationService, DefaultAuthenticationService>();

            // Add Auth0 authentication if enabled in settings.
            services.AddAuth0AuthenticationIfEnabled(configuration.GetSection("Auth0"));

            // Add TalentLms integration if enabled in settings.
            services.AddTalentLmsIfEnabled(configuration.GetSection("TalentLms"));

            // Add Zoom external services if enabled in settings.
            services.AddZoomIfEnabled(configuration.GetSection("Zoom"));

            // Add Health Checks
            services.AddApplicationHealthChecks(configuration.GetSection(Constants.HealthCheckConfigurationKey));

            // Added for the renderpage service
            services.AddHttpContextAccessor();
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddConvertoServices(configuration.GetSection("Converto"));
            services.AddTransient<CertificatePdfRenderer>();
            services.AddHttpClient();
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
                        .AddHealthCheckEndpoint(Constants.HealthCheckName, $"{baseUri}{Constants.HealthCheckUri}");
                })
                .AddInMemoryStorage();
        }
    }
}
