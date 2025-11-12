using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.TestAbstractions;

public class DummyHttpMessageHandler : HttpMessageHandler
{
    public string TextToReturn { get; set; }

    public string ReturnContentType { get; set; } = "application/json";

    public HttpStatusCode StatusToReturn { get; set; } = HttpStatusCode.OK;

    public List<HttpRequestMessage> Requests { get; } = new();

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,
        CancellationToken cancellationToken) =>
        Task.FromResult(new HttpResponseMessage(StatusToReturn)
        {
            Content = new StringContent(TextToReturn, Encoding.UTF8, ReturnContentType)
        });
}
