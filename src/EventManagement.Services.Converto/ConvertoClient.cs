using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace EventManagement.Services.Converto
{
    public class ConvertoClient : IConvertoClient
    {
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IOptions<ConvertoConfig> options;
        private readonly ILogger<ConvertoClient> logger;

        private string accessToken;
        private JwtSecurityToken securityToken;

        public ConvertoClient(
            IHttpClientFactory httpClientFactory,
            IOptions<ConvertoConfig> options,
            ILogger<ConvertoClient> logger)
        {
            this.options = options;
            this.logger = logger;
            this.httpClientFactory = httpClientFactory;
        }

        public async Task<Stream> Html2PdfAsync(string html, float scale, string format)
        {
            await this.EnsureLoggedInAsync();

            var client = this.httpClientFactory.CreateClient();
            var endpointUrl = this.options.Value.Html2PdfEndpointUrl;

            this.logger.LogDebug($"Sending HTML to {endpointUrl}");
            this.logger.LogTrace(html);

            try
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", this.accessToken);

                var response = await client.PostAsync(endpointUrl, new FormUrlEncodedContent(
                    new List<KeyValuePair<string, string>>
                    {
                        KeyValuePair.Create("html", html),
                        KeyValuePair.Create("scale", scale.ToString(CultureInfo.InvariantCulture)),
                        KeyValuePair.Create("format", format)
                    }));

                if (!response.IsSuccessStatusCode)
                {
                    throw new ConvertoClientException($"{endpointUrl} returned {response.StatusCode} status code");
                }

                return await response.Content.ReadAsStreamAsync();
            }
            catch (IOException e)
            {
                throw new ConvertoClientException($"Failed to authenticate using endpoint {endpointUrl}", e);
            }
        }

        private async Task EnsureLoggedInAsync()
        {
            if (this.securityToken != null && this.securityToken.ValidTo > DateTime.UtcNow.AddMinutes(1))
            {
                return;
            }

            var client = this.httpClientFactory.CreateClient();
            var endpointUrl = this.options.Value.LoginEndpointUrl;

            try
            {
                this.logger.LogDebug($"Authenticate using {endpointUrl}");

                var response = await client.PostAsync(endpointUrl, new FormUrlEncodedContent(
                    new List<KeyValuePair<string, string>>
                    {
                        KeyValuePair.Create("identifier", this.options.Value.Username),
                        KeyValuePair.Create("password", this.options.Value.Password)
                    }));

                if (!response.IsSuccessStatusCode)
                {
                    throw new ConvertoClientException($"{endpointUrl} returned {response.StatusCode} status code");
                }

                var json = JObject.Parse(await response.Content.ReadAsStringAsync());
                this.accessToken = json.Value<string>("jwt");
                this.securityToken = new JwtSecurityTokenHandler().ReadJwtToken(this.accessToken);
            }
            catch (IOException e)
            {
                throw new ConvertoClientException($"Failed to authenticate using endpoint {endpointUrl}", e);
            }
        }
    }
}
