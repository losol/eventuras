using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Eventuras.Services;
using Eventuras.WebApi.Auth;
using Eventuras.WebApi.Config;
using Eventuras.WebApi.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.FeatureManagement;
using Microsoft.OpenApi.Models;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using System.Linq;
using System.Text.Json.Serialization;

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
            services.AddControllers(options =>
                {
                    options.InputFormatters.Insert(0, GetJsonPatchInputFormatter());
                    options.Filters.Add<HttpResponseExceptionFilter>();
                })
                .AddJsonOptions(j =>
                {
                    j.JsonSerializerOptions.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                    j.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            services.AddRazorPages();
            services.ConfigureEf();
            services.ConfigureDbInitializationStrategy(Configuration);
            services.ConfigureAuthorizationPolicies(Configuration);
            services.AddEmailServices();
            services.AddSmsServices();
            services.AddInvoicingServices(Configuration, Features);
            services.AddApplicationServices(Configuration);
            services.AddFeatureManagement();
            services.AddMemoryCache();
            services.Configure<AuthSettings>(Configuration.GetSection("Auth"));

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


            var apiVersioningBuilder = services.AddApiVersioning(o =>
            {
                o.ApiVersionReader = new UrlSegmentApiVersionReader();
                o.DefaultApiVersion = new ApiVersion(3, 0);
            });

            apiVersioningBuilder.AddApiExplorer(o =>
            {
                o.GroupNameFormat = "'v'VVV";
                o.SubstituteApiVersionInUrl = true;
            });

            services.ConfigureIdentity();

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearerConfiguration(
                    Configuration["Auth:Issuer"],
                    Configuration["Auth:Audience"],
                    Configuration["Auth:ClientSecret"]
                );

            services.AddSingleton<IAuthorizationHandler, RequireScopeHandler>();

            // Add Swagger and configure it
            services.AddSwaggerGen();
            services.ConfigureOptions<ConfigureSwaggerOptions>();

        }

        private static NewtonsoftJsonPatchInputFormatter GetJsonPatchInputFormatter()
        {
            var builder = new ServiceCollection()
                .AddLogging()
                .AddMvc()
                .AddNewtonsoftJson()
                .Services.BuildServiceProvider();

            return builder
                .GetRequiredService<IOptions<MvcOptions>>()
                .Value
                .InputFormatters
                .OfType<NewtonsoftJsonPatchInputFormatter>()
                .First();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IApiVersionDescriptionProvider apiversions)
        {
            foreach (var service in app.ApplicationServices.GetServices<IStartupService>())
            {
                service.OnStartup();
            }

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    foreach (var description in apiversions.ApiVersionDescriptions)
                    {
                        c.SwaggerEndpoint(
                            $"/swagger/{description.GroupName}/swagger.json",
                            description.GroupName.ToLowerInvariant()
                        );
                    }

                });
            }

            app.UseRouting();

            app.UseStaticFiles();

            app.UseCors();

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
        }
    }
}
