using EventManagement.Services.Converto;
using losol.EventManagement.Config;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using losol.EventManagement.Services.DbInitializers;
using losol.EventManagement.Services.Invoicing;
using losol.EventManagement.Web.Config;
using losol.EventManagement.Web.Extensions;
using losol.EventManagement.Web.Services;
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
using Microsoft.Extensions.Hosting;
using System.Globalization;

namespace EventManagement.Web.Extensions
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
                options.UseSqlServer(config.GetConnectionString("DefaultConnection"));
                options.EnableSensitiveDataLogging(env.IsDevelopment());
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
                options.AddPolicy("AdministratorRole", policy => policy.RequireRole(Roles.Admin, Roles.SuperAdmin));
            });
        }

        public static void ConfigureMvc(
            this IServiceCollection services)
        {
            services
                .AddControllersWithViews()
                .AddNewtonsoftJson();

            services
                .AddRazorPages()
                .AddRazorPagesOptions(options =>
                {
                    options.Conventions.AuthorizeFolder("/Account/Manage");
                    options.Conventions.AuthorizePage("/Account/Logout");

                    options.Conventions.AuthorizeFolder("/Admin", "AdministratorRole");
                    options.Conventions.AddPageRoute("/Events/Details", "events/{id}/{slug?}");

                    options.Conventions.AuthorizeFolder("/Profile");

                    options.Conventions.AddPageRoute("/Events/Register/Index", "events/{id}/{slug?}/register");
                })
                .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix);
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
            services.AddScoped<IEventInfoService, EventInfoService>();
            services.AddScoped<IPaymentMethodService, PaymentMethodService>();
            services.AddScoped<StripeInvoiceProvider>();
            services.AddScoped<IRegistrationService, RegistrationService>();
            services.AddScoped<IProductsService, ProductsService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<ICertificatesService, CertificatesService>();
            services.AddScoped<IMessageLogService, MessageLogService>();
            services.AddTransient<IOrderVmConversionService, OrderVmConversionService>();

            // Add Page render Service
            services.AddScoped<IRenderService, ViewRenderService>();


            // Added for the renderpage service
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddConvertoServices(configuration.GetSection("Converto"));
            services.AddTransient<CertificatePdfRenderer>();
            services.AddHttpClient();
        }

    }
}
