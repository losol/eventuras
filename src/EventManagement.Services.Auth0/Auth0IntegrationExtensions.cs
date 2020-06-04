using losol.EventManagement.Services;
using losol.EventManagement.Services.Auth;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Threading.Tasks;

namespace EventManagement.Services.Auth0
{
    public static class Auth0IntegrationExtensions
    {
        public static IServiceCollection AddAuth0AuthenticationIfEnabled(
            this IServiceCollection services,
            IConfigurationSection configuration)
        {
            if (configuration?.GetValue<bool>("Enabled") != true)
            {
                return services;
            }

            var settings = configuration.Get<Auth0IntegrationSettings>();
            ValidationHelper.ValidateObject(settings);
            services.AddSingleton(Options.Create(settings));

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => settings.CheckConsentNeeded;

                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddTransient<IEventManagementAuthenticationService, Auth0AuthenticationService>();
            services.AddTransient<IOauthTicketReceivedHandler, OauthTicketReceivedHandler>();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
                .AddCookie()
                .AddOpenIdConnect(Auth0IntegrationConstants.AuthScheme, options =>
                {
                    // Set the authority to your Auth0 domain
                    options.Authority = $"https://{settings.Domain}";

                    // Configure the Auth0 Client ID and Client Secret
                    options.ClientId = settings.ClientId;
                    options.ClientSecret = settings.ClientSecret;

                    // Set the callback path, so Auth0 will call back to http://{StartupUrl}/callback
                    // Also ensure that you have added the URL as an Allowed Callback URL in your Auth0 dashboard
                    options.CallbackPath = new PathString(settings.CallbackPath);

                    // Configure the Claims Issuer to be Auth0
                    options.ClaimsIssuer = settings.ClaimsIssuer;

                    // Configure the scope
                    options.Scope.Clear();
                    foreach (var scope in settings.Scopes)
                    {
                        options.Scope.Add(scope);
                    }

                    // Set the correct name claim type
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        NameClaimType = settings.NameClaimType,
                        RoleClaimType = settings.RoleClaimType
                    };

                    options.Events = new OpenIdConnectEvents
                    {
                        OnRedirectToIdentityProvider = context =>
                        {
                            if (!string.IsNullOrEmpty(settings.ApiIdentifier))
                            {
                                context.ProtocolMessage.SetParameter("audience", settings.ApiIdentifier);
                            }
                            return Task.FromResult(0);
                        },

                        // handle the logout redirection
                        OnRedirectToIdentityProviderForSignOut = (context) =>
                        {
                            var logoutUri = $"https://{settings.Domain}/v2/logout?client_id={settings.ClientId}";

                            var postLogoutUri = context.Properties.RedirectUri;
                            if (!string.IsNullOrEmpty(postLogoutUri))
                            {
                                if (postLogoutUri.StartsWith("/"))
                                {
                                    // transform to absolute
                                    var request = context.Request;
                                    postLogoutUri = request.Scheme + "://" + request.Host + request.PathBase + postLogoutUri;
                                }
                                logoutUri += $"&returnTo={ Uri.EscapeDataString(postLogoutUri)}";
                            }

                            context.Response.Redirect(logoutUri);
                            context.HandleResponse();

                            return Task.CompletedTask;
                        },

                        OnTicketReceived = async context =>
                        {
                            var handler = context.HttpContext.RequestServices.GetRequiredService<IOauthTicketReceivedHandler>();
                            await handler.TicketReceivedAsync(context);
                        }
                    };
                });

            return services;
        }
    }
}
