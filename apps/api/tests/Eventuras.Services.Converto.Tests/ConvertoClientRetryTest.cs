using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Eventuras.Services.Converto.Tests;

public class ConvertoClientRetryTest : IDisposable
{
    private readonly List<HttpClient> _httpClients = [];

    public void Dispose()
    {
        foreach (var httpClient in _httpClients)
        {
            httpClient.Dispose();
        }
    }

    [Fact]
    public async Task GeneratePdf_RetriesOnceWithFreshToken_When_PdfEndpoint_Returns401()
    {
        ConvertoTokenCache.Clear();

        var tokenCalls = 0;
        var pdfCalls = 0;
        var handler = new StubHandler(request =>
        {
            var url = request.RequestUri!.AbsoluteUri;

            if (url.Contains("/token"))
            {
                tokenCalls++;
                return Json(HttpStatusCode.OK, $"{{\"access_token\":\"tok{tokenCalls}\",\"expires_in\":3600}}");
            }

            // PDF endpoint: reject the first (cached-token) attempt, accept the retry.
            pdfCalls++;
            if (pdfCalls == 1)
            {
                return new HttpResponseMessage(HttpStatusCode.Unauthorized)
                {
                    Content = new StringContent("unauthorized")
                };
            }

            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new ByteArrayContent([1, 2, 3])
            };
        });

        var client = NewClient(handler);

        await using var stream = await client.GeneratePdfFromHtmlAsync("<html></html>", 1f);
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);

        Assert.Equal(new byte[] { 1, 2, 3 }, ms.ToArray());
        Assert.Equal(2, pdfCalls); // retried once after the 401
        Assert.Equal(2, tokenCalls); // fetched a fresh token for the retry

        ConvertoTokenCache.Clear();
    }

    [Fact]
    public async Task GeneratePdf_DoesNotRetry_When_PdfEndpoint_Succeeds()
    {
        ConvertoTokenCache.Clear();

        var pdfCalls = 0;
        var handler = new StubHandler(request =>
        {
            if (request.RequestUri!.AbsoluteUri.Contains("/token"))
            {
                return Json(HttpStatusCode.OK, "{\"access_token\":\"tok\",\"expires_in\":3600}");
            }

            pdfCalls++;
            return new HttpResponseMessage(HttpStatusCode.OK) { Content = new ByteArrayContent([9]) };
        });

        var client = NewClient(handler);

        await using var stream = await client.GeneratePdfFromHtmlAsync("<html></html>", 1f);
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);

        Assert.Equal(new byte[] { 9 }, ms.ToArray());
        Assert.Equal(1, pdfCalls);

        ConvertoTokenCache.Clear();
    }

    private ConvertoClient NewClient(HttpMessageHandler handler)
    {
        var httpClient = new HttpClient(handler);
        _httpClients.Add(httpClient);

        var factory = new Mock<IHttpClientFactory>();
        factory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

        var options = Options.Create(new ConvertoConfig
        {
            PdfEndpointUrl = "https://converto.test/pdf",
            TokenEndpointUrl = "https://converto.test/token",
            ClientId = "id",
            ClientSecret = "secret"
        });

        return new ConvertoClient(factory.Object, options, NullLogger<ConvertoClient>.Instance);
    }

    private static HttpResponseMessage Json(HttpStatusCode status, string body) =>
        new(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    private sealed class StubHandler(Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        public List<string> Requests { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Requests.Add(request.RequestUri!.AbsoluteUri);
            return Task.FromResult(responder(request));
        }
    }
}
