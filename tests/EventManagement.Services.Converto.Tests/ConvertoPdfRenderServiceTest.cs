using losol.EventManagement.Services.Pdf;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace EventManagement.Services.Converto.Tests
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
            string loginPath = "/auth/local",
            string endpointPath = "/convert/html/to/pdf",
            int defaultScale = 1,
            string defaultFormat = "A4",
            string username = null,
            string password = null)
        {
            var baseUri = Environment.GetEnvironmentVariable(ConvertoTestEnv.ApiBaseUriEnvKey);
            Assert.NotNull(baseUri);
            Assert.NotEmpty(baseUri);

            baseUri = baseUri.TrimEnd('/');
            username ??= Environment.GetEnvironmentVariable(ConvertoTestEnv.UsernameEnvKey);
            password ??= Environment.GetEnvironmentVariable(ConvertoTestEnv.PasswordEnvKey);

            var options = Options.Create(new ConvertoConfig
            {
                LoginEndpointUrl = $"{baseUri}{loginPath}",
                Html2PdfEndpointUrl = $"{baseUri}{endpointPath}",
                DefaultScale = defaultScale,
                DefaultFormat = defaultFormat,
                Username = username,
                Password = password
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
            await using var stream = await NewService(loginPath: "/auth/login2")
                .RenderHtmlAsync("<html></html>", new PdfRenderOptions());
            await CheckEmptyAsync(stream);
        }

        [ConvertoEnvSpecificFact]
        public async Task ShouldReturnEmptyPdfStreamForInvalidEndpointUrl()
        {
            await using var stream = await NewService(endpointPath: "/convert/html/to/pdf2")
                .RenderHtmlAsync("<html></html>",
                    new PdfRenderOptions());
            await CheckEmptyAsync(stream);
        }

        [ConvertoEnvSpecificFact]
        public async Task ShouldReturnEmptyPdfStreamForInvalidCredentials()
        {
            await using var stream = await NewService(username: "invalid")
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
