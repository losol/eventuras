using IdentityServer4.Models;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;

namespace losol.EventManagement.IdentityServer
{
    public static class Config
    {
        public static IEnumerable<ApiResource> GetApis(IConfigurationSection configuration)
        {
            return new[]
            {
                new ApiResource(configuration["Identity:Id"],configuration["Identity:Name"]), // TODO: is it needed?
                new ApiResource(configuration["EventManagement:Id"],configuration["EventManagement:Name"])
            };
        }

        public static IEnumerable<Client> GetClients(IConfigurationSection configuration)
        {
            var webClientUrl = configuration["Web:Url"].TrimEnd('/');
            var spaClientUrl = configuration["Spa:Url"].TrimEnd('/');

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
                    AllowedScopes = configuration.GetSection("Web:AllowedScopes")
                        .AsEnumerable()
                        .Select(kvPair => kvPair.Value)
                        .ToArray()
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
                        .AsEnumerable()
                        .Select(kvPair => $"{webClientUrl}/{kvPair.Value.TrimStart('/')}")
                        .ToArray(),

                    PostLogoutRedirectUris = { $"{spaClientUrl}/{configuration["Spa:PostLogoutRedirectPath"].TrimStart('/')}" },
                    AllowedCorsOrigins = { webClientUrl },

                    AllowedScopes = configuration.GetSection("Spa:AllowedScopes")
                        .AsEnumerable()
                        .Select(kvPair => kvPair.Value)
                        .ToArray()
                }
            };
        }
    }
}
