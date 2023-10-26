using Eventuras.Services.Pdf;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.IO;
using System.Threading.Tasks;


namespace Eventuras.Services.Converto
{
    internal class ConvertoPdfRenderService : IPdfRenderService
    {
        private readonly IConvertoClient _client;
        private readonly IOptions<ConvertoConfig> _options;
        private readonly ILogger<ConvertoPdfRenderService> _logger;

        public ConvertoPdfRenderService(
            IConvertoClient client,
            IOptions<ConvertoConfig> options,
            ILogger<ConvertoPdfRenderService> logger)
        {
            _client = client;
            _options = options;
            _logger = logger;
        }

        public async Task<Stream> RenderHtmlAsync(string html, PdfRenderOptions pdfRenderOptions)
        {
            try
            {
                return await _client.Html2PdfAsync(html,
                    pdfRenderOptions.Scale ?? _options.Value.DefaultScale ?? 1,
                    pdfRenderOptions.Format ?? _options.Value.DefaultFormat ?? "A4");
            }
            catch (ConvertoClientException e)
            {
                _logger.LogError(e.Message, e);
                return new MemoryStream();
            }
        }
    }
}
