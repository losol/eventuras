using System.Linq;
using Eventuras.WebApi.Config;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Microsoft.FeatureManagement;
using Eventuras.WebApi.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Eventuras.WebApi.Auth;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

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
            services.ConfigureDbInitializationStrategy(Configuration, _env);
            services.ConfigureAuthorizationPolicies(Configuration);
            services.AddEmailServices(AppSettings.EmailProvider, Configuration);
            services.AddSmsServices(AppSettings.SmsProvider, Configuration);
            services.AddInvoicingServices(Configuration, Features);
            services.AddApplicationServices(Configuration);
            services.AddFeatureManagement();
            services.AddMemoryCache();
            
            services.AddControllers(options =>
            {
                options.InputFormatters.Insert(0, GetJsonPatchInputFormatter());
                options.Filters.Add(new HttpResponseExceptionFilter());
            })
                .AddJsonOptions(j =>
                {
                    j.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

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
                            Configuration["Auth:ApiIdentifier"],
                            Configuration["Auth:JwtSecret"]
                        );


            services.AddSingleton<IAuthorizationHandler, RequireScopeHandler>();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v3", new OpenApiInfo { Title = "Eventuras.WebApi", Version = "v3" });
            });
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
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v3/swagger.json", "Eventuras.WebApi v3"));
            }

            app.UseRouting();

            // Use Cors only in production environments
            if (env.IsProduction())
            {
                app.UseCors();
            }

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
