using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Threading.Tasks;
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


    public async Task<Stream> GeneratePdfFromHtmlAsync(string html, float scale, string format)
    {

        var client = _httpClientFactory.CreateClient();
        var endpointUrl = _options.Value.PdfEndpointUrl;
        var apiToken = _options.Value.ApiToken;

        _logger.LogInformation("Converting HTML to PDF using endpoint {endpointUrl}", endpointUrl);

        try
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiToken);

            var response = await client.PostAsync(endpointUrl, new StringContent(JsonConvert.SerializeObject(new
            {
                html,
                scale,
                format
            }), Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("{endpointUrl} returned {response.StatusCode} status code", endpointUrl, response.StatusCode);
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
            throw new ConvertoClientException("Converto exception: {exception}", e);
        }
    }
}
