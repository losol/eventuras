using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Xunit;
using StringWithQualityHeaderValue = System.Net.Http.Headers.StringWithQualityHeaderValue;

namespace losol.EventManagement.IntegrationTests
{
    public static class HttpClientExtensions
    {
        public static async Task<HttpResponseMessage> PostAsync(this HttpClient httpClient, string requestUri, IDictionary<string, string> data)
        {
            var token = await httpClient.GetAntiForgeryTokenAsync();

            data.Add("__RequestVerificationToken", token);

            return await httpClient.PostAsync(requestUri, new FormUrlEncodedContent(data));
        }

        public static async Task<HttpResponseMessage> LoginAsync(this HttpClient httpClient, string email, string password)
        {
            return await httpClient.PostAsync("/Account/Login", new Dictionary<string, string>
            {
                { "Email", email },
                { "Password", password }
            });
        }

        public static async Task<HttpResponseMessage> LogInAsSuperAdminAsync(this HttpClient httpClient)
        {
            return await httpClient.LoginAsync(SeedData.SuperAdminEmail, SeedData.SuperAdminPassword);
        }

        public static async Task<string> GetAntiForgeryTokenAsync(this HttpClient httpClient)
        {
            SetCookieHeaderValue antiForgeryCookie = null;

            var response = await httpClient.GetAsync("/Account/Login");
            Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
            if (response.Headers.TryGetValues("Set-Cookie", out var values))
            {
                antiForgeryCookie = SetCookieHeaderValue.ParseList(values.ToList()).SingleOrDefault(c =>
                    c.Name.StartsWith(".AspNetCore.AntiForgery.", StringComparison.InvariantCultureIgnoreCase));
            }
            Assert.NotNull(antiForgeryCookie);
            httpClient.DefaultRequestHeaders.Add("Cookie", new CookieHeaderValue(antiForgeryCookie.Name, antiForgeryCookie.Value).ToString());

            var responseHtml = await response.Content.ReadAsStringAsync();
            var match = AntiForgeryFormFieldRegex.Match(responseHtml);
            var antiForgeryToken = match.Success ? match.Groups[1].Captures[0].Value : null;
            Assert.NotNull(antiForgeryToken);
            return antiForgeryToken;
        }

        public static void AcceptLanguage(this HttpClient httpClient, string languageIsoCode)
        {
            httpClient.DefaultRequestHeaders.AcceptLanguage.Add(new StringWithQualityHeaderValue(languageIsoCode));
        }

        private static readonly Regex AntiForgeryFormFieldRegex =
            new Regex(@"\<input name=""__RequestVerificationToken"" type=""hidden"" value=""([^""]+)"" \/\>");
    }
}
