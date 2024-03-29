using System;
using System.IO;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Pdf;
using Microsoft.AspNetCore.JsonPatch.Internal;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

[assembly: System.Runtime.CompilerServices.InternalsVisibleTo("Eventuras.Services.Converto.Tests")]
namespace Eventuras.Services.Converto;


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

    public async Task<Stream> GeneratePdfFromHtml(string html, PdfRenderOptions pdfRenderOptions)
    {
        try
        {
            return await _client.GeneratePdfFromHtmlAsync(html,
                pdfRenderOptions.Scale ?? _options.Value.DefaultScale ?? 1,
                pdfRenderOptions.PaperSize ?? _options.Value.DefaultPaperSize);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to convert HTML to: {ExceptionMessage}", e.Message);
            throw new ServiceException("Unable to generate PDF fro HTML", e);
        }
    }
}
