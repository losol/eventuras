using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Eventuras.Services.Converto
{
    internal class ConvertoClient : IConvertoClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IOptions<ConvertoConfig> _options;
        private readonly ILogger<ConvertoClient> _logger;

        private string _accessToken;
        private JwtSecurityToken _securityToken;

        public ConvertoClient(
            IHttpClientFactory httpClientFactory,
            IOptions<ConvertoConfig> options,
            ILogger<ConvertoClient> logger)
        {
            _options = options;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> LoginAsync()
        {
            var client = _httpClientFactory.CreateClient();
            var endpointUrl = _options.Value.LoginEndpointUrl;

            try
            {
                _logger.LogDebug($"Authenticate using {endpointUrl}");

                var response = await client.PostAsync(endpointUrl, new FormUrlEncodedContent(
                    new List<KeyValuePair<string, string>>
                    {
                        KeyValuePair.Create("identifier", _options.Value.Username),
                        KeyValuePair.Create("password", _options.Value.Password)
                    }));

                if (!response.IsSuccessStatusCode)
                {
                    throw new ConvertoClientException($"{endpointUrl} returned {response.StatusCode} status code");
                }

                var json = JObject.Parse(await response.Content.ReadAsStringAsync());
                return json.Value<string>("jwt");
            }
            catch (IOException e)
            {
                throw new ConvertoClientException($"Failed to authenticate using endpoint {endpointUrl}", e);
            }
        }

        public async Task<Stream> Html2PdfAsync(string html, float scale, string format)
        {
            await EnsureLoggedInAsync();

            var client = _httpClientFactory.CreateClient();
            var endpointUrl = _options.Value.Html2PdfEndpointUrl;

            _logger.LogDebug($"Sending HTML to {endpointUrl}");
            _logger.LogTrace(html);

            try
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

                var response = await client.PostAsync(endpointUrl, new StringContent(JsonConvert.SerializeObject(new
                {
                    html,
                    scale,
                    format
                }), Encoding.UTF8, "application/json"));

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
            if (_securityToken != null && _securityToken.ValidTo > DateTime.UtcNow.AddMinutes(1))
            {
                return;
            }
            _accessToken = await LoginAsync();
            _securityToken = new JwtSecurityTokenHandler().ReadJwtToken(_accessToken);
        }
    }
}
