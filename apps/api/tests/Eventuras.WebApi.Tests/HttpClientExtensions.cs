using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Constants;
using Eventuras.TestAbstractions;

namespace Eventuras.WebApi.Tests;

internal static class HttpClientExtensions
{
    public static HttpClient AuthenticatedAsAdmin(this HttpClient httpClient)
    {
        return httpClient.Authenticated(role: Roles.Admin);
    }

    public static HttpClient AuthenticatedAsSystemAdmin(this HttpClient httpClient)
    {
        return httpClient.Authenticated(role: Roles.SystemAdmin);
    }

    public static HttpClient AuthenticatedAsSuperAdmin(this HttpClient httpClient)
    {
        return httpClient.Authenticated(role: Roles.SuperAdmin);
    }

    public static HttpClient AuthenticatedAs(this HttpClient httpClient, ApplicationUser user,
        params string[] roles)
    {
        return httpClient.Authenticated(
            firstName: user.Name,
            email: user.Email,
            roles: roles,
            phoneNumber: user.PhoneNumber);
    }

    public static HttpClient WithAcceptHeader(this HttpClient httpClient, string headerValue)
    {
        httpClient.DefaultRequestHeaders.Accept
            .Add(new MediaTypeWithQualityHeaderValue(headerValue));
        return httpClient;
    }

    public static HttpClient Authenticated(
        this HttpClient httpClient,
        string firstName = TestingConstants.Placeholder,
        string lastName = TestingConstants.Placeholder,
        string email = TestingConstants.Placeholder,
        string role = null,
        string[] roles = null,
        string[] scopes = null,
        string phoneNumber = null)
    {
        var claims = BuildClaims(firstName, lastName, email, role, roles, scopes, phoneNumber);
        var token = FakeJwtManager.GenerateJwtToken(claims);
        httpClient.DefaultRequestHeaders.Remove("Authorization");
        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
        return httpClient;
    }

    private static Claim[] BuildClaims(
        string firstName,
        string lastName,
        string email,
        string role,
        string[] roles,
        string[] scopes,
        string phoneNumber)
    {
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

        var claims = new List<Claim>();

        if (!string.IsNullOrEmpty(firstName))
        {
            claims.Add(new Claim(ClaimTypes.Name, firstName));
        }

        if (!string.IsNullOrEmpty(lastName))
        {
            claims.Add(new Claim(ClaimTypes.Surname, lastName));
        }

        if (!string.IsNullOrEmpty(email))
        {
            claims.Add(new Claim(ClaimTypes.Email, email));
        }

        roles ??= Array.Empty<string>();
        if (!string.IsNullOrEmpty(role))
        {
            roles = roles.Append(role).ToArray();
        }

        if (roles.Any())
        {
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
        }

        if (!string.IsNullOrEmpty(phoneNumber))
        {
            claims.Add(new Claim(ClaimTypes.MobilePhone, phoneNumber));
        }

        if (scopes != null && scopes.Any())
        {
            claims.AddRange(scopes.Select(s => new Claim("scope", s)));
        }

        return claims.ToArray();
    }

    public static async Task<HttpResponseMessage> PostAsync(
        this HttpClient httpClient,
        string requestUri,
        object data,
        int? organizationId = null,
        Dictionary<string, string> headers = null)
    {
        var content = new StringContent(
            JsonSerializer.Serialize(data),
            Encoding.UTF8,
            new MediaTypeHeaderValue("application/json"));

        // Eventuras org id header
        if (organizationId.HasValue)
        {
            content.Headers.Add(Eventuras.Services.Constants.Api.OrganizationHeader, organizationId.ToString());
        }

        // Additional headers provided
        if (headers != null)
        {
            foreach (var header in headers)
            {
                content.Headers.Add(header.Key, header.Value);
            }
        }

        return await httpClient.PostAsync(requestUri, content);
    }

    public static async Task<HttpResponseMessage> PostAsync(
        this HttpClient httpClient,
        string requestUri)
    {
        return await httpClient.PostAsync(requestUri, new { });
    }

    public static async Task<HttpResponseMessage> PutAsync(
        this HttpClient httpClient,
        string requestUri,
        object data)
    {
        return await httpClient.PutAsync(requestUri,
            new StringContent(
                JsonSerializer.Serialize(data),
                Encoding.UTF8,
                new MediaTypeHeaderValue("application/json")));
    }

    public static async Task<HttpResponseMessage> PutAsync(
        this HttpClient httpClient,
        string requestUri)
    {
        return await httpClient.PutAsync(requestUri, new { });
    }

    public static async Task<HttpResponseMessage> PatchAsync(
        this HttpClient httpClient,
        string requestUri,
        object data)
    {
        return await httpClient.PatchAsync(requestUri,
            new StringContent(
                JsonSerializer.Serialize(data),
                Encoding.UTF8,
                new MediaTypeHeaderValue("application/json")));
    }

    public static async Task<HttpResponseMessage> DeleteAsync(
        this HttpClient httpClient,
        string requestUri,
        object data)
    {
        return await httpClient.SendAsync(
            new HttpRequestMessage(HttpMethod.Delete, requestUri)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(data),
                    Encoding.UTF8,
                    new MediaTypeHeaderValue("application/json"))
            });
    }

    public static async Task<HttpResponseMessage> GetAsync(
        this HttpClient httpClient,
        string requestUri,
        object data)
    {
        var props = new List<PropertyInfo>(data.GetType().GetProperties());
        var pairs = new List<string>(props.Count);
        foreach (PropertyInfo prop in props)
        {
            var propValue = prop.GetValue(data, null);
            var encoded = propValue != null ? WebUtility.UrlEncode(propValue.ToString()) : null;
            pairs.Add($"{prop.Name}={encoded}");
        }

        var query = string.Join("&", pairs);
        return await httpClient.GetAsync($"{requestUri}?{query}");
    }
}
