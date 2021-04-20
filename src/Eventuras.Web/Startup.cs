using Eventuras.Web.Extensions;
using Eventuras.Web.Config;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using HealthChecks.UI.Client;
using Eventuras.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc.Versioning;

namespace Eventuras
{
    public class Startup
    {
        private static readonly string[] SupportedCultures = new[]
        {
            "nb-NO"
        };

        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            HostingEnvironment = env;
        }

        public IWebHostEnvironment HostingEnvironment { get; }
        public IConfiguration Configuration { get; }
        private AppSettings appSettings;
        public AppSettings AppSettings
        {
            get
            {
                if (appSettings == null)
                {
                    appSettings = Configuration.GetSection("AppSettings").Get<AppSettings>();
                }
                return appSettings;
            }
            protected set => appSettings = value;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public virtual void ConfigureServices(IServiceCollection services)
        {

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    builder =>
                          builder
                            .WithOrigins(AppSettings.AllowedOrigins.Split(',')
                                .Select(x => x.Trim())
                                .Where(x => !string.IsNullOrWhiteSpace(x))
                                .ToArray())
                                .AllowAnyHeader()
                                .AllowCredentials()
                                .AllowAnyMethod());
            });

            services.ConfigureEF(Configuration, HostingEnvironment);
            services.ConfigureIdentity();
            services.ConfigureDbInitializationStrategy(Configuration, HostingEnvironment);
            services.ConfigureAuthorizationPolicies();
            services.ConfigureLocalization(new CultureInfo(Configuration["Site:DefaultLocale"]));
            services.ConfigureMvc();

            services.AddSiteConfig(Configuration);
            services.AddEmailServices(AppSettings.EmailProvider, Configuration);
            services.AddSmsServices(AppSettings.SmsProvider, Configuration);
            services.AddInvoicingServices(AppSettings, Configuration);
            services.AddApplicationServices(Configuration);
            services.AddAntiforgery();
            services.AddDatabaseDeveloperPageExceptionFilter();

            services.AddApiVersioning(o =>
            {
                o.ApiVersionReader = new UrlSegmentApiVersionReader();
                o.AssumeDefaultVersionWhenUnspecified = true;
                o.DefaultApiVersion = new ApiVersion(1, 0);
            });

            // Register the Swagger generator
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v0", new OpenApiInfo { Title = "Eventuras API", Version = "v0" });
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Eventuras API", Version = "v1" });
                c.SwaggerDoc("v2", new OpenApiInfo { Title = "Eventuras API", Version = "v2.0" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public virtual void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseMigrationsEndPoint();
            }
            else
            {
                app.UseExceptionHandler("/Info/Error");
            }

            // Localization
            var cultureInfoList = SupportedCultures.Select(c => new CultureInfo(c)).ToList();
            var requestCultureProviders = new List<IRequestCultureProvider>
                {
                    new QueryStringRequestCultureProvider(),
                    new CookieRequestCultureProvider()
                };

            // Use localization by language header only in development environment
            if (env.IsDevelopment())
            {
                requestCultureProviders.Add(new AcceptLanguageHeaderRequestCultureProvider());
            }

            app.UseRequestLocalization(new RequestLocalizationOptions
            {
                DefaultRequestCulture = new RequestCulture(Configuration["Site:DefaultLocale"]),
                SupportedCultures = cultureInfoList,
                SupportedUICultures = cultureInfoList,
                RequestCultureProviders = requestCultureProviders
            });

            // Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.RoutePrefix = "api";
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Eventuras API V1");
            });

            app.UseStaticFiles();
            app.UseRouting();
            app.UseCors();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapRazorPages();

                if (Configuration.HealthChecksEnabled())
                {
                    endpoints.MapHealthChecks(Constants.HealthCheckUri, new HealthCheckOptions
                    {
                        Predicate = _ => true,
                        ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
                    })
                        .WithDisplayName(_ => Constants.HealthCheckName);
                    endpoints.MapHealthChecksUI();
                }
            });
        }
    }
}
