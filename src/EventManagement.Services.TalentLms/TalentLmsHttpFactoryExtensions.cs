using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace EventManagement.Services.TalentLms
{
    internal static class TalentLmsHttpFactoryExtensions
    {
        public static HttpClient CreateTalentLmsHttpClient(this IHttpClientFactory httpClientFactory, TalentLmsSettings settings)
        {
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings));
            }
            var httpClient = httpClientFactory.CreateClient();
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{settings.ApiKey}:"));
            httpClient.DefaultRequestHeaders.Authorization ??= new AuthenticationHeaderValue("Basic", credentials);
            httpClient.BaseAddress ??= new Uri($"https://{settings.SiteName}.talentlms.com/api/v1/");
            return httpClient;
        }
    }
}
