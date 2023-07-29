using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Eventuras.Services.Pdf;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Eventuras.Services.Converto.Tests
{
    public class ConvertoPdfRenderServiceTest : IDisposable
    {
        private readonly HttpClient _httpClient = new HttpClient();
        private readonly IHttpClientFactory _httpClientFactory;

        public ConvertoPdfRenderServiceTest()
        {
            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>()))
                .Returns(_httpClient);
            _httpClientFactory = httpClientFactoryMock.Object;
        }

        public void Dispose()
        {
            _httpClient.Dispose();
        }

        private ConvertoPdfRenderService NewService(
            string pdfEndpointPath = "/api/pdfcreo",
            int defaultScale = 1,
            string defaultFormat = "A4",
            string apitoken = null)
        {
            var baseUri = Environment.GetEnvironmentVariable(ConvertoTestEnv.ApiBaseUri);
            baseUri = baseUri.TrimEnd('/');
            Assert.NotNull(baseUri);
            Assert.NotEmpty(baseUri);

            apitoken = Environment.GetEnvironmentVariable(ConvertoTestEnv.ApiToken);

            var options = Options.Create(new ConvertoConfig
            {
                PdfEndpointUrl = $"{baseUri}{pdfEndpointPath}",
                DefaultScale = defaultScale,
                DefaultFormat = defaultFormat,
                ApiToken = apitoken
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
                .RenderHtmlAsync("<html></html>", new PdfRenderOptions());
            await CheckEmptyAsync(stream);
        }

        [ConvertoEnvSpecificFact]
        public async Task ShouldReturnEmptyPdfStreamForInvalidEndpointUrl()
        {
            await using var stream = await NewService(pdfEndpointPath: "/convert/html/to/pdf2")
                .RenderHtmlAsync("<html></html>",
                    new PdfRenderOptions());
            await CheckEmptyAsync(stream);
        }

        [ConvertoEnvSpecificFact]
        public async Task ShouldReturnEmptyPdfStreamForInvalidCredentials()
        {
            await using var stream = await NewService(apitoken: "invalid")
                .RenderHtmlAsync("<html></html>",
                    new PdfRenderOptions());
            await CheckEmptyAsync(stream);
        }

        [ConvertoEnvSpecificFact]
        public async Task ShouldCreateEmptyPdf()
        {
            await using var stream = await NewService().RenderHtmlAsync("<html></html>", new PdfRenderOptions());
            await CheckNotEmptyAsync(stream);
        }

        [ConvertoEnvSpecificFact]
        public async Task ShouldRenderLargePdf()
        {
            // Initially caused "Invalid URI: The Uri string is too long."
            var html = $"<html>{new string('A', 200000)}</html>";
            await using var stream = await NewService().RenderHtmlAsync(html, new PdfRenderOptions());
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
}
