using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using losol.EventManagement.Config;
using EventManagement.Web.Extensions;
using Microsoft.Extensions.Hosting;

namespace losol.EventManagement
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostEnvironment env)
        {
            this.Configuration = configuration;
            this.HostingEnvironment = env;
           
        }

        public IHostEnvironment HostingEnvironment { get; }
        public IConfiguration Configuration { get; }
        private AppSettings appSettings;
        public AppSettings AppSettings
        {
            get
            {
                if (this.appSettings == null)
                {
                    this.appSettings = this.Configuration.GetSection("AppSettings").Get<AppSettings>();
                }
                return this.appSettings;
            }
            protected set => this.appSettings = value;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public virtual void ConfigureServices(IServiceCollection services)
        {
            services.ConfigureEF(this.Configuration, this.HostingEnvironment);
            services.ConfigureIdentity();
            services.ConfigureDbInitializationStrategy(this.Configuration, this.HostingEnvironment);
            services.ConfigureAuthorizationPolicies();
            ServiceCollectionExtensions.ConfigureInternationalization();
            // services.ConfigureMvc();
            services.AddControllersWithViews();
            services.AddRazorPages();
            services.AddSiteConfig(this.Configuration);
            services.AddEmailServices(this.AppSettings.EmailProvider, this.Configuration);
            services.AddSmsServices(this.AppSettings.SmsProvider, this.Configuration);
            services.AddInvoicingServices(this.AppSettings, this.Configuration);
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
        public virtual void Configure(IApplicationBuilder app, IHostEnvironment env, ILoggerFactory loggerFactory)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                //app.UseDatabaseErrorPage();
                app.UseExceptionHandler("/Info/Error");
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
            app.UseRouting();
            //app.UseMvc();
            //app.UseEndpoints(endpoints =>
            //{
            //    endpoints.MapControllerRoute(
            //        name: "default",
            //        pattern: "{controller=Account}/{action=Index}/{id?}");
            //});
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
            });
        }
    }
}
