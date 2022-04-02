using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.Services.Auth;
using Eventuras.Services.Auth0;
using Eventuras.Services.Converto;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Email;
using Eventuras.Services.Google.RecaptchaV3;
using Eventuras.Services.PowerOffice;
using Eventuras.Services.SendGrid;
using Eventuras.Services.Sms;
using Eventuras.Services.Smtp;
using Eventuras.Services.Stripe;
using Eventuras.Services.TalentLms;
using Eventuras.Services.Twilio;
using Eventuras.Services.Zoom;
using Eventuras.Web.Config;
using Eventuras.Web.Services;
using Losol.Communication.HealthCheck.Abstractions;
using Losol.Communication.HealthCheck.Email;
using Losol.Communication.HealthCheck.Sms;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using NodaTime;
using NodaTime.Serialization.JsonNet;
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
                    .UseNpgsql(config.GetConnectionString("DefaultConnection"),
                        o => o.UseNodaTime())
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
                .AddNewtonsoftJson(s => 
                    s.SerializerSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb));

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

        public static void ConfigureDbInitializationStrategy(this IServiceCollection services,
            IConfiguration config)
        {
            services.Configure<DbInitializerOptions>(config);
            services.AddScoped<IDbInitializer, DbInitializer>();
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

        public static void AddEmailServices(this IServiceCollection services)
        {
            services.AddConfigurableEmailServices();
            services.AddConfigurableSmtpServices();
            services.AddConfigurableSendGridServices();
            services.AddTransient<MagicLinkSender>();
            services.AddTransient<RegistrationEmailSender>();
        }

        public static void AddSmsServices(this IServiceCollection services)
        {
            services.AddConfigurableSmsServices();
            services.AddConfigurableTwilioServices();
        }

        public static void AddInvoicingServices(
            this IServiceCollection services,
            AppSettings appsettings,
            IConfiguration config)
        {
            if (appsettings.UsePowerOffice)
            {
                services.AddPowerOffice(config.GetSection("PowerOffice"));
            }
            
            if (appsettings.UseStripeInvoice)
            {
                services.AddStripe(config.GetSection("Stripe"));
            }
        }

        public static void AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register our application services
            services.AddCoreServices();

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

            services.AddRecaptchaV3(configuration.GetSection("Google:RecaptchaV3"));

            // Added for the renderpage service
            services.AddHttpContextAccessor();
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddConvertoServices(configuration.GetSection("Converto"));
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
