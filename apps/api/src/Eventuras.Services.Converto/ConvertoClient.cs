using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Eventuras.Libs.Pdf;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.Converto;

internal class ConvertoClient : IConvertoClient
{
    /// <summary>
    ///     Name of the resilient HttpClient (for PDF rendering) registered in
    ///     <see cref="ConvertoServicesExtensions" />. Transient failures and timeouts are retried
    ///     by the resilience handler on that client; its timeouts are tuned for slow PDF rendering.
    /// </summary>
    internal const string HttpClientName = "converto";

    /// <summary>
    ///     Name of the HttpClient used for token requests. Registered separately with shorter
    ///     timeouts so an auth/token-endpoint outage fails fast instead of inheriting the long
    ///     PDF-render timeouts.
    /// </summary>
    internal const string TokenHttpClientName = "converto-token";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ConvertoClient> _logger;
    private readonly IOptions<ConvertoConfig> _options;

    public ConvertoClient(
        IHttpClientFactory httpClientFactory,
        IOptions<ConvertoConfig> options,
        ILogger<ConvertoClient> logger)
    {
        _options = options;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<Stream> GeneratePdfFromHtmlAsync(string html, float scale, PaperSize paperSize = PaperSize.A4)
    {
        var endpointUrl = _options.Value.PdfEndpointUrl;

        _logger.LogInformation("Sending request to generate PDF at {EndpointUrl}", endpointUrl);

        try
        {
            var response = await PostPdfRequestAsync(endpointUrl, html, scale, paperSize, forceTokenRefresh: false);

            // A cached token can be rejected if it was rotated/revoked on the
            // Converto side or there is clock skew. Drop it, fetch a fresh token, and retry once.
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                _logger.LogWarning(
                    "Converto returned 401 Unauthorized for PDF generation; clearing cached token and retrying once.");
                response.Dispose();
                ConvertoTokenCache.Clear();
                response = await PostPdfRequestAsync(endpointUrl, html, scale, paperSize, forceTokenRefresh: true);
            }

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("PDF generation failed: {StatusCode}, Response: {ErrorContent}",
                    response.StatusCode, errorContent);

                if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    throw new AuthenticationException("Unauthorized request to Converto API.");
                }

                throw new ConvertoClientException($"Failed to generate PDF. Status: {response.StatusCode}");
            }

            return await response.Content.ReadAsStreamAsync();
        }
        catch (AuthenticationException)
        {
            // Already logged above (or in GetApiTokenAsync); surface as-is so the
            // API can map it to 503 Service Unavailable.
            throw;
        }
        catch (ConvertoClientException)
        {
            throw;
        }
        catch (HttpRequestException e)
        {
            // Reached only after the resilience handler exhausted its retries.
            _logger.LogError(e, "HTTP request to Converto API failed after retries: {ExceptionMessage}", e.Message);
            throw new ConvertoClientException("Error occurred while communicating with Converto API.", e);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error while generating PDF via Converto: {ExceptionMessage}", e.Message);
            throw new ConvertoClientException($"Unexpected error occurred: {e.Message}", e);
        }
    }

    private async Task<HttpResponseMessage> PostPdfRequestAsync(
        string endpointUrl, string html, float scale, PaperSize paperSize, bool forceTokenRefresh)
    {
        var token = await GetApiTokenAsync(forceTokenRefresh);

        var client = _httpClientFactory.CreateClient(HttpClientName);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var requestBody = new { html, scale, paperSize };
        var serializerOptions = new JsonSerializerOptions { Converters = { new JsonStringEnumConverter() } };

        using var content = new StringContent(
            JsonSerializer.Serialize(requestBody, serializerOptions), Encoding.UTF8, "application/json");

        return await client.PostAsync(endpointUrl, content);
    }

    private async Task<string> GetApiTokenAsync(bool forceRefresh = false)
    {
        if (!forceRefresh)
        {
            var cachedToken = ConvertoTokenCache.GetToken();
            if (cachedToken != null)
            {
                return cachedToken;
            }
        }

        var client = _httpClientFactory.CreateClient(TokenHttpClientName);

        // Get credentials
        var clientId = _options.Value.ClientId;
        var clientSecret = _options.Value.ClientSecret;

        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
        {
            _logger.LogError("Converto client credentials are missing from configuration.");
            throw new AuthenticationException("Client ID or Client Secret is missing from configuration.");
        }

        var credentials = $"{clientId}:{clientSecret}";
        var base64Credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes(credentials));

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Credentials);

        var requestBody = new { grant_type = "client_credentials" };

        using var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await client.PostAsync(
            _options.Value.TokenEndpointUrl,
            content
        );

        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Converto token request failed: {StatusCode}, Response: {ResponseContent}",
                response.StatusCode, responseContent);

            throw new AuthenticationException($"Failed to retrieve API token. Status: {response.StatusCode}");
        }

        var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseContent);
        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            _logger.LogError("Converto token endpoint returned an invalid token response.");
            throw new AuthenticationException("Invalid token response from server.");
        }

        ConvertoTokenCache.SetToken(tokenResponse.AccessToken, tokenResponse.ExpiresIn);

        return tokenResponse.AccessToken;
    }

    private class TokenResponse
    {
        [JsonPropertyName("access_token")] public string AccessToken { get; set; }

        [JsonPropertyName("token_type")] public string TokenType { get; set; } = "Bearer";

        [JsonPropertyName("expires_in")] public int ExpiresIn { get; set; }
    }
}
