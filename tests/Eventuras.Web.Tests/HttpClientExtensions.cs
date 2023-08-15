using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Eventuras.TestAbstractions;
using Microsoft.Net.Http.Headers;
using Xunit;
using StringWithQualityHeaderValue = System.Net.Http.Headers.StringWithQualityHeaderValue;

namespace Eventuras.IntegrationTests;

internal static class HttpClientExtensions
{
    public static async Task<HttpResponseMessage> PostAsync(
        this HttpClient httpClient,
        string requestUri,
        IDictionary<string, string> data,
        string requestVerificationToken)
    {
        if (!string.IsNullOrEmpty(requestVerificationToken)) data.Add("__RequestVerificationToken", requestVerificationToken);
        return await httpClient.PostAsync(requestUri, new FormUrlEncodedContent(data));
    }

    public static async Task<HttpResponseMessage> PostAsync(this HttpClient httpClient, string requestUri, IDictionary<string, string> data)
    {
        var token = await httpClient.GetAntiForgeryTokenAsync(requestUri); // Obtain token from the same URL
        return await httpClient.PostAsync(requestUri, data, token);
    }

    public static async Task<HttpResponseMessage> LoginAsync(this HttpClient httpClient, string email, string password)
    {
        var token = await httpClient.GetAntiForgeryTokenAsync("/Account/Login");
        return await httpClient.PostAsync("/Account/Login",
            new Dictionary<string, string>
            {
                { "Email", email },
                { "Password", password },
            },
            token);
    }

    public static async Task<HttpResponseMessage> LogInAsSuperAdminAsync(this HttpClient httpClient)
        => await httpClient.LoginAsync(TestingConstants.SuperAdminEmail, TestingConstants.SuperAdminPassword);

    public static async Task<string> GetAntiForgeryTokenAsync(this HttpClient httpClient, string requestUri)
    {
        SetCookieHeaderValue antiForgeryCookie = null;

        var response = await httpClient.GetAsync(requestUri);
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        if (response.Headers.TryGetValues("Set-Cookie", out var values))
        {
            var setCookieHeaderValues = SetCookieHeaderValue.ParseList(values.ToList());
            antiForgeryCookie = setCookieHeaderValues.SingleOrDefault(c
                => c.Name.StartsWith(".AspNetCore.AntiForgery.", StringComparison.InvariantCultureIgnoreCase));
        }

        if (antiForgeryCookie != null)
            httpClient.DefaultRequestHeaders.Add("Cookie", new CookieHeaderValue(antiForgeryCookie.Name, antiForgeryCookie.Value).ToString());

        var responseHtml = await response.Content.ReadAsStringAsync();
        var match = AntiForgeryFormFieldRegex.Match(responseHtml);
        return match.Success ? match.Groups[1].Captures[0].Value : null;
    }

    public static void AcceptLanguage(this HttpClient httpClient, string languageIsoCode)
    {
        httpClient.DefaultRequestHeaders.AcceptLanguage.Add(new StringWithQualityHeaderValue(languageIsoCode));
    }

    private static readonly Regex AntiForgeryFormFieldRegex =
        new(@"\<input name=""__RequestVerificationToken"" type=""hidden"" value=""([^""]+)"" \/\>");
}