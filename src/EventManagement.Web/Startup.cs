using System.Globalization;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using losol.EventManagement.Services.DbInitializers;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.Web.Services;
using losol.EventManagement.Services.Messaging.Sms;
using losol.EventManagement.Services.Invoicing;
using losol.EventManagement.Config;
using losol.EventManagement.Web.Config;
using losol.EventManagement.Web.Extensions;
using System.Collections.Generic;

namespace losol.EventManagement
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;
            HostingEnvironment = env;
        }

        public IHostingEnvironment HostingEnvironment { get; }
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public virtual void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
              options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
              options.EnableSensitiveDataLogging(HostingEnvironment.IsDevelopment());
            });


                // sqlite: options.UseSqlite(Configuration.GetConnectionString("DefaultConnection")));

            services.AddIdentity<ApplicationUser, IdentityRole>(config =>
            {
                config.SignIn.RequireConfirmedEmail = true;
            })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders()
                .AddMagicLinkTokenProvider();

            // Require SSL
            // TODO Re-enable
            /* if (HostingEnvironment.IsProduction())
            {
                services.Configure<MvcOptions>(options =>
                {
                    options.Filters.Add(new RequireHttpsAttribute());
                });
            }
            */


            // Set password requirements
            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 7;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
            });

            // Set culture info
            var cultureInfo = new CultureInfo("nb-NO");
            CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
            CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;


            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdministratorRole", policy => policy.RequireRole("Admin", "SuperAdmin"));
            });

            services.AddMvc()
                .AddRazorPagesOptions(options =>
                {
                    options.Conventions.AuthorizeFolder("/Account/Manage");
                    options.Conventions.AuthorizePage("/Account/Logout");

                    options.Conventions.AuthorizeFolder("/Admin", "AdministratorRole");
                    options.Conventions.AddPageRoute("/Events/Details", "events/{id}/{slug?}");

                    options.Conventions.AuthorizeFolder("/Profile");

                    options.Conventions.AddPageRoute("/Events/Register/Index", "events/{id}/{slug?}/register");
                });

            // For sending antiforgery in ajax?
            // services.AddAntiforgery(o => o.HeaderName = "XSRF-TOKEN");

            // Register the Database Seed initializer & email sender services
            services.Configure<DbInitializerOptions>(Configuration);
            switch(HostingEnvironment)
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

            var siteConfig = Configuration.GetSection("Site").Get<Site>();
            services.AddSingleton(siteConfig);
            var appsettings = Configuration.GetSection("AppSettings").Get<AppSettings>();

			// Register the correct email provider depending on the config
			switch(appsettings.EmailProvider)
			{
				case EmailProvider.SendGrid:
					services.Configure<SendGridOptions>(Configuration.GetSection("SendGrid"));
					services.AddTransient<IEmailSender, SendGridEmailSender>();
					break;
                case EmailProvider.SMTP:
					services.Configure<SmtpOptions>(Configuration.GetSection("Smtp"));
					services.AddTransient<IEmailSender, SmtpEmailSender>();
					break;
				case EmailProvider.File:
					services.AddTransient<IEmailSender, FileEmailWriter>();
					break;
				case EmailProvider.Mock:
					services.AddTransient<IEmailSender, MockEmailSender>();
					break;
			}

			// Register email services
			services.AddTransient<StandardEmailSender>();
            services.AddTransient<MagicLinkSender>();
			services.AddTransient<RegistrationEmailSender>();

            // Register SMS services
			switch(appsettings.SmsProvider)
			{
				case SmsProvider.Twilio:
					services.Configure<TwilioOptions>(Configuration.GetSection("Twilio"));
					services.AddTransient<ISmsSender, TwilioSmsSender>();
					break;
				case SmsProvider.Mock:
					services.AddTransient<ISmsSender, MockSmsSender>();
					break;
			}

            // Register PowerOffice
            if(appsettings.UsePowerOffice)
            {
                services.Configure<PowerOfficeOptions>(Configuration.GetSection("PowerOffice"));
                services.AddScoped<IInvoicingService, PowerOfficeService>();
            }
            else if(appsettings.UseStripe)
            {
                // STRIPE OVERRIDES POWEROFFICE
                // THIS NEEDS TO BE DOCUMENTED OR CHANGED
                services.Configure<StripeOptions>(Configuration.GetSection("Stripe"));
                services.AddScoped<IInvoicingService, StripeInvoicingService>();
            }
            else
            {
                services.AddTransient<IInvoicingService, MockInvoicingService>();
            }


			// Register our application services
			services.AddScoped<IEventInfoService, EventInfoService>();
            services.Configure<List<PaymentMethod>>(Configuration.GetSection("PaymentMethods"));
			services.AddScoped<IPaymentMethodService, PaymentMethodService>();
			services.AddScoped<IRegistrationService, RegistrationService>();
			services.AddScoped<IProductsService, ProductsService>();
			services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<ICertificatesService, CertificatesService>();
            services.AddScoped<IMessageLogService, MessageLogService>();

            // Add Page render Service
            services.AddScoped<IRenderService, ViewRenderService>();


            // Added for the renderpage service
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();

			services.AddNodeServices();
			services.AddTransient<CertificatePdfRenderer>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public virtual void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Info/Error");
            }

            app.UseStaticFiles();

            app.UseAuthentication();

            // TODO reenable
            /*
            if (env.IsProduction()) {
                var options = new RewriteOptions()
                .AddRedirectToHttps();
                app.UseRewriter(options);
            }
             */

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });
        }
    }
}
