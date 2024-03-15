using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
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


    public async Task<Stream> Html2PdfAsync(string html, float scale, string format)
    {

        var client = _httpClientFactory.CreateClient();
        var endpointUrl = _options.Value.PdfEndpointUrl;
        var apiToken = _options.Value.ApiToken;

        _logger.LogDebug($"Sending HTML to {endpointUrl}");
        _logger.LogTrace(html);

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
                throw new ConvertoClientException($"{endpointUrl} returned {response.StatusCode} status code");
            }

            return await response.Content.ReadAsStreamAsync();
        }
        catch (IOException e)
        {
            throw new ConvertoClientException($"Failed to authenticate using endpoint {endpointUrl}", e);
        }
    }

}
