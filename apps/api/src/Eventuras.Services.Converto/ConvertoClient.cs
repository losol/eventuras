using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Threading.Tasks;
using Eventuras.Domain;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;


namespace Eventuras.Services.Converto;

internal class ConvertoClient : IConvertoClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IOptions<ConvertoConfig> _options;
    private readonly ILogger<ConvertoClient> _logger;


    public ConvertoClient(
        IHttpClientFactory httpClientFactory,
        IOptions<ConvertoConfig> options,
        ILogger<ConvertoClient> logger)
    {
        _options = options;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    private class TokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }


    }
    private async Task<string> GetApiTokenAsync()
    {
        // Check if we have a cached token, and return it if it's still valid
        var cachedToken = ConvertoTokenCache.GetToken();
        if (cachedToken != null)
        {
            return cachedToken;
        }

        // Get a new token
        var client = _httpClientFactory.CreateClient();
        var clientCredentials = new
        {
            client_id = _options.Value.ClientId,
            client_secret = _options.Value.ClientSecret,
            grant_type = "client_credentials"
        };

        var response = await client.PostAsync(_options.Value.TokenEndpointUrl,
            new StringContent(JsonConvert.SerializeObject(clientCredentials), Encoding.UTF8, "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Token endpoint {tokenEndpoint} returned {StatusCode}", _options.Value.TokenEndpointUrl, response.StatusCode);
            throw new AuthenticationException($"Failed to retrieve API token. Status code: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonConvert.DeserializeObject<TokenResponse>(responseContent);

        ConvertoTokenCache.SetToken(tokenResponse.AccessToken, tokenResponse.ExpiresIn);

        return tokenResponse.AccessToken;
    }

    public async Task<Stream> GeneratePdfFromHtmlAsync(string html, float scale, PaperSize paperSize = PaperSize.A4)
    {
        var client = _httpClientFactory.CreateClient();
        var endpointUrl = _options.Value.PdfEndpointUrl;
        var convertoAccessToken = await GetApiTokenAsync();

        _logger.LogInformation("Converting HTML to PDF using endpoint {EndpointUrl}", endpointUrl);

        try
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", convertoAccessToken);

            var response = await client.PostAsync(endpointUrl, new StringContent(JsonConvert.SerializeObject(new
            {
                html,
                scale,
                paperSize
            }), Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("{EndpointUrl} returned {StatusCode} status code", endpointUrl, response.StatusCode);
                throw new ConvertoClientException($"{endpointUrl} returned {response.StatusCode} status code");
            }

            return await response.Content.ReadAsStreamAsync();
        }
        catch (HttpRequestException e)
        {
            _logger.LogError(e, "Converto request failed: {ExceptionMessage}", e.Message);

            // Authenticationn error
            if (e.Message.Contains("401"))
            {
                throw new AuthenticationException("Converto request failed: Unauthorized", e);
            }

            throw new HttpRequestException("Converto request failed", e);
        }
        catch (Exception e)
        {
            throw new ConvertoClientException($"Converto exception: {e.Message}");
        }
    }



}
