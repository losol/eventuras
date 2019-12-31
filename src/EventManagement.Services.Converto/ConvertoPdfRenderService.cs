using losol.EventManagement.Services.Pdf;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.IO;
using System.Threading.Tasks;

namespace EventManagement.Services.Converto
{
    public class ConvertoPdfRenderService : IPdfRenderService
    {
        private readonly IConvertoClient client;
        private readonly IOptions<ConvertoConfig> options;
        private readonly ILogger<ConvertoPdfRenderService> logger;

        public ConvertoPdfRenderService(
            IConvertoClient client,
            IOptions<ConvertoConfig> options,
            ILogger<ConvertoPdfRenderService> logger)
        {
            this.client = client;
            this.options = options;
            this.logger = logger;
        }

        public async Task<Stream> RenderHtmlAsync(string html, PdfRenderOptions pdfRenderOptions)
        {
            try
            {
                return await this.client.Html2PdfAsync(html,
                    pdfRenderOptions.Scale ?? this.options.Value.DefaultScale ?? 1,
                    pdfRenderOptions.Format ?? this.options.Value.DefaultFormat ?? "A4");
            }
            catch (ConvertoClientException e)
            {
                this.logger.LogError(e.Message, e);
                return new MemoryStream();
            }
        }
    }
}
