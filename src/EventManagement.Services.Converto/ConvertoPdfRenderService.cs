using losol.EventManagement.Services.Pdf;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace EventManagement.Services.Converto
{
    public class ConvertoPdfRenderService : IPdfRenderService
    {
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IOptions<ConvertoConfig> options;
        private readonly ILogger<ConvertoPdfRenderService> logger;

        public ConvertoPdfRenderService(
            IHttpClientFactory httpClientFactory,
            IOptions<ConvertoConfig> options,
            ILogger<ConvertoPdfRenderService> logger)
        {
            this.httpClientFactory = httpClientFactory;
            this.options = options;
            this.logger = logger;
        }

        public async Task<Stream> RenderHtmlAsync(string html, PdfRenderOptions options)
        {
            var client = this.httpClientFactory.CreateClient();
            var endpointUrl = this.options.Value.EndpointUrl;

            this.logger.LogDebug($"Sending HTML to {endpointUrl}");
            this.logger.LogDebug(html);

            var response = await client.PostAsync(endpointUrl, new FormUrlEncodedContent(new List<KeyValuePair<string, string>>
            {
                KeyValuePair.Create("html", html),
                KeyValuePair.Create("scale", (options.Scale ?? this.options.Value.DefaultScale ?? 1).ToString(CultureInfo.InvariantCulture)),
                KeyValuePair.Create("format", options.Format ?? this.options.Value.DefaultFormat ?? "A4")
            }));

            if (!response.IsSuccessStatusCode)
            {
                this.logger.LogError($"{endpointUrl} returned {response.StatusCode} status code");
                return new MemoryStream();
            }

            return await response.Content.ReadAsStreamAsync();
        }
    }
}
