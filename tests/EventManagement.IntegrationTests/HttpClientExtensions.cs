using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Xunit;

namespace losol.EventManagement.IntegrationTests
{
    public static class HttpClientExtensions
    {
        public static async Task<HttpResponseMessage> LoginAsync(this HttpClient httpClient, string email, string password)
        {
            return await httpClient.UseAntiForgeryTokenAsync(async token =>
            {
                var response = await httpClient.PostAsync("/Account/Login", new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "Email", email },
                    { "Password", password },
                    { "__RequestVerificationToken", token }
                }));

                Assert.Equal(HttpStatusCode.Found, response.StatusCode);
                return response;
            });
        }

        public static async Task<HttpResponseMessage> LogInAsSuperAdminAsync(this HttpClient httpClient)
        {
            return await httpClient.LoginAsync(SeedData.SuperAdminEmail, SeedData.SuperAdminPassword);
        }

        public static async Task<HttpResponseMessage> UseAntiForgeryTokenAsync(this HttpClient httpClient, Func<string, Task<HttpResponseMessage>> callbackAction)
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
            httpClient.DefaultRequestHeaders.Clear();
            return await callbackAction(antiForgeryToken);
        }

        private static readonly Regex AntiForgeryFormFieldRegex =
            new Regex(@"\<input name=""__RequestVerificationToken"" type=""hidden"" value=""([^""]+)"" \/\>");
    }
}
