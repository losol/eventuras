using Eventuras.TestAbstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using Eventuras.Domain;
using Eventuras.Services;

namespace Eventuras.WebApi.Tests
{
    internal static class HttpClientExtensions
    {
        public static HttpClient SetAuthenticatedAsSystemAdmin(this HttpClient httpClient)
        {
            return httpClient.SetAuthenticated(role: Roles.SystemAdmin);
        }

        public static HttpClient SetAuthenticatedAsSuperAdmin(this HttpClient httpClient)
        {
            return httpClient.SetAuthenticated(role: Roles.SuperAdmin);
        }

        public static HttpClient SetAuthenticated(this HttpClient httpClient, ApplicationUser user, params string[] roles)
        {
            return httpClient.SetAuthenticated(
                user.Id,
                user.Name,
                null, // FIXME: we don't have surname in AspNetCore.Identity?
                user.Email,
                roles: roles);
        }

        public static HttpClient SetAuthenticated(
            this HttpClient httpClient,
            string id = TestingConstants.Placeholder,
            string firstName = TestingConstants.Placeholder,
            string lastName = TestingConstants.Placeholder,
            string email = TestingConstants.Placeholder,
            string role = null,
            string[] roles = null,
            string[] scopes = null)
        {
            var claims = BuildClaims(id, firstName, lastName, email, role, roles, scopes);
            var token = FakeJwtManager.GenerateJwtToken(claims);
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            return httpClient;
        }

        private static Claim[] BuildClaims(
            string id,
            string firstName,
            string lastName,
            string email,
            string role,
            string[] roles,
            string[] scopes)
        {
            if (TestingConstants.Placeholder.Equals(id))
            {
                id = Guid.NewGuid().ToString();
            }
            if (TestingConstants.Placeholder.Equals(firstName))
            {
                firstName = "Test";
            }
            if (TestingConstants.Placeholder.Equals(lastName))
            {
                lastName = $"Person {Guid.NewGuid()}";
            }
            if (TestingConstants.Placeholder.Equals(email))
            {
                email = $"test-person+{Guid.NewGuid()}@email.com";
            }
            scopes ??= TestingConstants.DefaultScopes;
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, id),
                new Claim("scope", string.Join(" ", scopes))
            };
            if (!string.IsNullOrEmpty(firstName))
            {
                claims.Add(new Claim(ClaimTypes.Name, firstName));
            }
            if (!string.IsNullOrEmpty(firstName))
            {
                claims.Add(new Claim(ClaimTypes.Surname, lastName));
            }
            if (!string.IsNullOrEmpty(email))
            {
                claims.Add(new Claim(ClaimTypes.Surname, email));
            }
            if (roles == null && role != null)
            {
                roles = new[] { role };
            }
            if (roles != null && roles.Any())
            {
                claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
            }
            return claims.ToArray();
        }
    }
}
