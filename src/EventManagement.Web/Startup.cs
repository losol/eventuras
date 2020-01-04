using EventManagement.Web.Extensions;
using losol.EventManagement.Config;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System.Globalization;
using System.Linq;

namespace losol.EventManagement
{
    public class Startup
    {
        private static readonly string[] SupportedCultures = new[]
        {
            "nb-NO", // default one goes first
            "en-US"
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
            services.ConfigureEF(Configuration, HostingEnvironment);
            services.ConfigureIdentity();
            services.ConfigureDbInitializationStrategy(Configuration, HostingEnvironment);
            services.ConfigureAuthorizationPolicies();
            services.ConfigureLocalization(new CultureInfo(SupportedCultures[0]));
            services.ConfigureMvc();

            services.AddSiteConfig(Configuration);
            services.AddEmailServices(AppSettings.EmailProvider, Configuration);
            services.AddSmsServices(AppSettings.SmsProvider, Configuration);
            services.AddInvoicingServices(AppSettings, Configuration);
            services.AddApplicationServices(Configuration);

            services.AddApiVersioning(o =>
            {
                o.ReportApiVersions = true;
                o.AssumeDefaultVersionWhenUnspecified = true;
                o.DefaultApiVersion = new ApiVersion(1, 0);
            });


            // Register the Swagger generator
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v0", new OpenApiInfo { Title = "Eventuras API", Version = "v0" });
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Eventuras API", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public virtual void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Info/Error");
            }

            var cultureInfoList = SupportedCultures.Select(c => new CultureInfo(c)).ToList();
            app.UseRequestLocalization(new RequestLocalizationOptions
            {
                DefaultRequestCulture = new RequestCulture(SupportedCultures[0]),
                // Formatting numbers, dates, etc.
                SupportedCultures = cultureInfoList,
                // UI strings that we have localized.
                SupportedUICultures = cultureInfoList
            });

            // Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.RoutePrefix = "api";
                c.SwaggerEndpoint("/swagger/v0/swagger.json", "Eventuras API V0");
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Eventuras API V1");
            });

            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapRazorPages();
            });


        }
    }
}
