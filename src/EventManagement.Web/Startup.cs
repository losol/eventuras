using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using losol.EventManagement.Config;
using EventManagement.Web.Extensions;

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
        private AppSettings appSettings;
        public AppSettings AppSettings
        {
            get
            {
                if(appSettings == null)
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
            ServiceCollectionExtensions.ConfigureInternationalization();
            services.ConfigureMvc();

            services.AddSiteConfig(Configuration);
			services.AddEmailServices(AppSettings.EmailProvider, Configuration);
            services.AddSmsServices(AppSettings.SmsProvider, Configuration);
            services.AddInvoicingServices(AppSettings, Configuration);
			services.AddApplicationServices();

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
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public virtual void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
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

            app.UseMvc();
        }
    }
}
