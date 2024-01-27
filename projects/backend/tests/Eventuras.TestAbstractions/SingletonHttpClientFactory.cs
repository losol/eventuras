using System;
using System.Net.Http;

namespace Eventuras.TestAbstractions
{
    public class SingletonHttpClientFactory : IHttpClientFactory, IDisposable
    {
        private readonly HttpClient _client = new HttpClient();

        public void Dispose()
        {
            _client.Dispose();
        }

        public HttpClient CreateClient(string name)
        {
            return _client;
        }
    }
}