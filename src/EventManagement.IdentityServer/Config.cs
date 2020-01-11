using IdentityServer4.Models;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;

namespace losol.EventManagement.IdentityServer
{
    public static class Config
    {
        public static IEnumerable<IdentityResource> GetIds()
        {
            return new IdentityResource[]
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
            };
        }

        public static IEnumerable<ApiResource> GetApis(IConfigurationSection configuration)
        {
            return new[]
            {
                new ApiResource(configuration["Identity:Id"],configuration["Identity:Name"]),
                new ApiResource(configuration["EventManagement:Id"],configuration["EventManagement:Name"])
            };
        }

        public static IEnumerable<Client> GetClients(IConfigurationSection configuration)
        {
            var webClientUrl = configuration["Web:Url"].TrimEnd('/');
            var spaClientUrl = configuration["Spa:Url"].TrimEnd('/');

            var webClientScopes = configuration.GetSection("Web:AllowedScopes")
                .GetChildren()
                .Select(s => s.Value)
                .ToArray();


            var spaClientScopes = configuration.GetSection("Spa:AllowedScopes")
                .GetChildren()
                .Select(s => s.Value)
                .ToArray();

            return new[]
            {
                // MVC client using hybrid flow
                new Client
                {
                    ClientId = configuration["Web:Id"],
                    ClientName = configuration["Web:Name"],
                    RequireConsent = false,
                    AllowedGrantTypes = GrantTypes.HybridAndClientCredentials,
                    ClientSecrets = { new Secret(configuration["Web:Secret"].Sha256()) },
                    RedirectUris = { $"{webClientUrl}/{configuration["Web:RedirectPath"].TrimStart('/')}" },
                    FrontChannelLogoutUri = $"{webClientUrl}/{configuration["Web:FrontChannelLogoutPath"].TrimStart('/')}",
                    PostLogoutRedirectUris =
                    {
                        $"{webClientUrl}/{configuration["Web:PostLogoutRedirectPath"].TrimStart('/')}"
                    },
                    AllowOfflineAccess = true,
                    AllowedScopes = webClientScopes
                },

                // SPA client using Code flow
                new Client
                {
                    ClientId = configuration["Spa:Id"],
                    ClientName = configuration["Spa:Name"],
                    ClientUri = spaClientUrl,
                    RequireConsent = false,
                    AllowedGrantTypes = GrantTypes.Code,
                    RequirePkce = true,
                    RequireClientSecret = false,
                    AllowAccessTokensViaBrowser = true,
                    RedirectUris = configuration.GetSection("Spa:RedirectPaths")
                        .GetChildren()
                        .Select(s => $"{spaClientUrl}/{s.Value.TrimStart('/')}")
                        .ToArray(),
                    PostLogoutRedirectUris = { $"{spaClientUrl}/{configuration["Spa:PostLogoutRedirectPath"].TrimStart('/')}" },
                    AllowedCorsOrigins = { spaClientUrl },
                    AllowedScopes = spaClientScopes
                }
            };
        }
    }
}
