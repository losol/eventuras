using System;
using System.IO;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Eventuras.Libs.Pdf;
using Eventuras.Services.Exceptions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

[assembly: InternalsVisibleTo("Eventuras.Services.Converto.Tests")]

namespace Eventuras.Services.Converto;

internal class ConvertoPdfRenderService : IPdfRenderService
{
    private readonly IConvertoClient _client;
    private readonly ILogger<ConvertoPdfRenderService> _logger;
    private readonly IOptions<ConvertoConfig> _options;

    public ConvertoPdfRenderService(
        IConvertoClient client,
        IOptions<ConvertoConfig> options,
        ILogger<ConvertoPdfRenderService> logger)
    {
        _client = client;
        _options = options;
        _logger = logger;
    }

    public async Task<Stream> GeneratePdfFromHtml(string html, PdfOptions PdfOptions)
    {
        try
        {
            var paperSize = PdfOptions.PaperSize ?? _options.Value.DefaultPaperSize;

            return await _client.GeneratePdfFromHtmlAsync(html,
                PdfOptions.Scale ?? _options.Value.DefaultScale ?? 1,
                paperSize);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to convert HTML to: {ExceptionMessage}", e.Message);
            throw new ServiceException("Unable to generate PDF fro HTML", e);
        }
    }
}
