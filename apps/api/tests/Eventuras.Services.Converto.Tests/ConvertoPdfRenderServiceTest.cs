using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Pdf;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Eventuras.Services.Converto.Tests;

public class ConvertoPdfRenderServiceTest : IDisposable
{
    private readonly HttpClient _httpClient = new();
    private readonly IHttpClientFactory _httpClientFactory;

    public ConvertoPdfRenderServiceTest()
    {
        var httpClientFactoryMock = new Mock<IHttpClientFactory>();
        httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>()))
            .Returns(_httpClient);
        _httpClientFactory = httpClientFactoryMock.Object;
    }

    public void Dispose() => _httpClient.Dispose();

    private ConvertoPdfRenderService NewService(
        string pdfEndpointPath = "/v1/pdf",
        string tokenEndpointUrl = "/token",
        int defaultScale = 1,
        string defaultPapersize = "A4",
        string clientId = null,
        string clientSecret = null)
    {
        var baseUri = Environment.GetEnvironmentVariable(ConvertoTestEnv.PdfEndpointUrl);
        baseUri = baseUri?.TrimEnd('/');
        Assert.NotNull(baseUri);
        Assert.NotEmpty(baseUri);

        clientId = clientId ?? Environment.GetEnvironmentVariable(ConvertoTestEnv.ClientId);
        clientSecret = clientSecret ?? Environment.GetEnvironmentVariable(ConvertoTestEnv.ClientSecret);

        var options = Options.Create(new ConvertoConfig
        {
            PdfEndpointUrl = $"{baseUri}{pdfEndpointPath}",
            TokenEndpointUrl = $"{baseUri}{tokenEndpointUrl}",
            DefaultScale = defaultScale,
            DefaultPaperSize = Enum.Parse<PaperSize>(defaultPapersize),
            ClientId = clientId,
            ClientSecret = clientSecret
        });

        var loggerFactory = new LoggerFactory();
        var convertoClient = new ConvertoClient(
            _httpClientFactory,
            options,
            loggerFactory.CreateLogger<ConvertoClient>());

        return new ConvertoPdfRenderService(
            convertoClient,
            options,
            loggerFactory.CreateLogger<ConvertoPdfRenderService>());
    }

    [ConvertoEnvSpecificFact]
    public async Task ShouldReturnEmptyPdfStreamForInvalidLoginUrl()
    {
        await using var stream = await NewService()
            .GeneratePdfFromHtml("<html></html>", new PdfRenderOptions());
        await CheckEmptyAsync(stream);
    }

    [ConvertoEnvSpecificFact]
    public async Task ShouldReturnEmptyPdfStreamForInvalidEndpointUrl()
    {
        await using var stream = await NewService("/convert/html/to/pdf2")
            .GeneratePdfFromHtml("<html></html>",
                new PdfRenderOptions());
        await CheckEmptyAsync(stream);
    }

    [ConvertoEnvSpecificFact]
    public async Task ShouldReturnEmptyPdfStreamForInvalidCredentials()
    {
        await using var stream = await NewService(clientId: "invalid", clientSecret: "invalid")
            .GeneratePdfFromHtml("<html></html>",
                new PdfRenderOptions());
        await CheckEmptyAsync(stream);
    }

    [ConvertoEnvSpecificFact]
    public async Task ShouldCreateEmptyPdf()
    {
        await using var stream = await NewService().GeneratePdfFromHtml("<html></html>", new PdfRenderOptions());
        await CheckNotEmptyAsync(stream);
    }

    [ConvertoEnvSpecificFact]
    public async Task ShouldRenderLargePdf()
    {
        // Initially caused "Invalid URI: The Uri string is too long."
        var html = $"<html>{new string('A', 200000)}</html>";
        await using var stream = await NewService().GeneratePdfFromHtml(html, new PdfRenderOptions());
        await CheckNotEmptyAsync(stream);
    }

    private static async Task CheckEmptyAsync(Stream stream)
    {
        var buffer = new byte[1024];
        var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
        Assert.Equal(0, bytesRead);
    }

    private static async Task CheckNotEmptyAsync(Stream stream)
    {
        var buffer = new byte[1024];
        var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
        Assert.True(bytesRead > 0);
    }
}
