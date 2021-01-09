using System.Linq;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.WebApi.Config;
using Eventuras.WebApi.Constants;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Microsoft.FeatureManagement;
using Eventuras.WebApi.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace Eventuras.WebApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            _env = env;
        }

        public IConfiguration Configuration { get; }
        private readonly IWebHostEnvironment _env;

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

        private FeatureManagement features;
        public FeatureManagement Features
        {
            get
            {
                if (features == null)
                {
                    features = Configuration.GetSection("FeatureManagement").Get<FeatureManagement>();
                }
                return features;
            }
            protected set => features = value;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.ConfigureEF(Configuration, _env);
            services.ConfigureIdentity();
            services.ConfigureDbInitializationStrategy(Configuration, _env);
            services.ConfigureAuthorizationPolicies(Configuration);
            services.AddEmailServices(AppSettings.EmailProvider, Configuration);
            services.AddSmsServices(AppSettings.SmsProvider, Configuration);
            services.AddInvoicingServices(Features, Configuration);
            services.AddApplicationServices(Configuration);
            services.AddFeatureManagement();

            services.AddControllers();

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

            services.AddApiVersioning(o =>
            {
                o.ApiVersionReader = new UrlSegmentApiVersionReader();
                o.AssumeDefaultVersionWhenUnspecified = true;
                o.DefaultApiVersion = new ApiVersion(1, 0);
            });

            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Authority = $"https://{Configuration["Auth0:Domain"]}/";
                    options.Audience = Configuration["Auth0:Audience"];
                    // If the access token does not have a `sub` claim, `User.Identity.Name` will be `null`. Map it to a different claim by setting the NameClaimType below.
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        NameClaimType = ClaimTypes.NameIdentifier
                    };
                });


            services.AddAuthorization(options =>
            {
                options.AddPolicy(AuthPolicies.AdministratorRole, policy => policy.RequireRole(Roles.Admin, Roles.SuperAdmin, Roles.SystemAdmin));
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v0", new OpenApiInfo { Title = "Eventuras.WebApi", Version = "v0" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Eventuras.WebApi v1"));
            }

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
