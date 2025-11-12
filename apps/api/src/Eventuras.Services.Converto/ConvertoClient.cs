using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Eventuras.Domain;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

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
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = "Bearer";

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }

    private async Task<string> GetApiTokenAsync()
    {
        var cachedToken = ConvertoTokenCache.GetToken();
        if (cachedToken != null)
        {
            return cachedToken;
        }

        var client = _httpClientFactory.CreateClient();

        // Get credentials
        var clientId = _options.Value.ClientId;
        var clientSecret = _options.Value.ClientSecret;

        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
        {
            throw new AuthenticationException("Client ID or Client Secret is missing from configuration.");
        }

        var credentials = $"{clientId}:{clientSecret}";
        var base64Credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes(credentials));

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Credentials);

        var requestBody = new
        {
            grant_type = "client_credentials"
        };

        using var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await client.PostAsync(
            _options.Value.TokenEndpointUrl,
            content
        );

        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Token request failed: {StatusCode}, Response: {ResponseContent}",
                response.StatusCode, responseContent);

            throw new AuthenticationException($"Failed to retrieve API token. Status: {response.StatusCode}");
        }

        var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseContent);
        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            throw new AuthenticationException("Invalid token response from server.");
        }

        ConvertoTokenCache.SetToken(tokenResponse.AccessToken, tokenResponse.ExpiresIn);

        return tokenResponse.AccessToken;
    }

    public async Task<Stream> GeneratePdfFromHtmlAsync(string html, float scale, PaperSize paperSize = PaperSize.A4)
    {
        var client = _httpClientFactory.CreateClient();
        var endpointUrl = _options.Value.PdfEndpointUrl;
        var convertoAccessToken = await GetApiTokenAsync();

        _logger.LogInformation("Sending request to generate PDF at {EndpointUrl}", endpointUrl);

        try
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", convertoAccessToken);

            var requestBody = new
            {
                html,
                scale,
                paperSize
            };

            var options = new JsonSerializerOptions
            {
                Converters = { new JsonStringEnumConverter() }
            };

            using var content = new StringContent(JsonSerializer.Serialize(requestBody, options), Encoding.UTF8, "application/json");
            var response = await client.PostAsync(
                endpointUrl,
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("PDF generation failed: {StatusCode}, Response: {ErrorContent}",
                    response.StatusCode, errorContent);

                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    throw new AuthenticationException("Unauthorized request to Converto API.");
                }

                throw new ConvertoClientException($"Failed to generate PDF. Status: {response.StatusCode}");
            }

            return await response.Content.ReadAsStreamAsync();
        }
        catch (HttpRequestException e)
        {
            _logger.LogError(e, "HTTP request error while calling Converto API: {ExceptionMessage}", e.Message);

            if (e.Message.Contains("401"))
            {
                throw new AuthenticationException("Unauthorized request to Converto API.", e);
            }

            throw new HttpRequestException("Error occurred while communicating with Converto API.", e);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error: {ExceptionMessage}", e.Message);
            throw new ConvertoClientException($"Unexpected error occurred: {e.Message}");
        }
    }
}
