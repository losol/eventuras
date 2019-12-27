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
        private readonly HttpClient httpClient = new HttpClient();
        private readonly IHttpClientFactory httpClientFactory;

        public ConvertoPdfRenderServiceTest()
        {
            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>()))
                .Returns(this.httpClient);
            this.httpClientFactory = httpClientFactoryMock.Object;
        }

        public void Dispose()
        {
            this.httpClient.Dispose();
        }

        private ConvertoPdfRenderService NewService(
            string loginUrl = "http://localhost:1337/auth/local",
            string endpointUrl = "http://localhost:1337/convert/html/to/pdf",
            int defaultScale = 1,
            string defaultFormat = "A4",
            string username = "tester",
            string password = "SomeCrypticPass")
        {
            var options = Options.Create(new ConvertoConfig
            {
                LoginEndpointUrl = loginUrl,
                Html2PdfEndpointUrl = endpointUrl,
                DefaultScale = defaultScale,
                DefaultFormat = defaultFormat,
                Username = username,
                Password = password
            });

            var loggerFactory = new LoggerFactory();
            var convertoClient = new ConvertoClient(
                this.httpClientFactory,
                options,
                loggerFactory.CreateLogger<ConvertoClient>());

            return new ConvertoPdfRenderService(
                convertoClient,
                options,
                loggerFactory.CreateLogger<ConvertoPdfRenderService>());
        }

        [Fact(Skip = "Provide URL for converto service")]
        public async Task ShouldReturnEmptyPdfStreamForInvalidLoginUrl()
        {
            using (var stream = await this.NewService(loginUrl: "http://localhost:1337/auth/login2")
                .RenderHtmlAsync("<html></html>",
                    new PdfRenderOptions()))
            {
                await CheckEmptyAsync(stream);
            }
        }

        [Fact(Skip = "Provide URL for converto service")]
        public async Task ShouldReturnEmptyPdfStreamForInvalidEndpointUrl()
        {
            using (var stream = await this.NewService(endpointUrl: "http://localhost:1337/convert/html/to/pdf2")
                .RenderHtmlAsync("<html></html>",
                    new PdfRenderOptions()))
            {
                await CheckEmptyAsync(stream);
            }
        }

        [Fact(Skip = "Provide URL for converto service")]
        public async Task ShouldReturnEmptyPdfStreamForInvalidCredentials()
        {
            using (var stream = await this.NewService(username: "invalid")
                .RenderHtmlAsync("<html></html>",
                    new PdfRenderOptions()))
            {
                await CheckEmptyAsync(stream);
            }
        }

        [Fact(Skip = "Provide URL for converto service")]
        public async Task ShouldCreateEmptyPdf()
        {
            using (var stream = await this.NewService().RenderHtmlAsync("<html></html>",
                new PdfRenderOptions()))
            {
                await CheckNotEmptyAsync(stream);
            }
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
