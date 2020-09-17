using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.IntegrationTests
{
    public static class HttpResponseMessageExtensions
    {
        public static async Task CheckBadRequestAsync(this HttpResponseMessage response, string expectedErrorText = null)
        {
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var str = await response.Content.ReadAsStringAsync();
            Assert.NotEmpty(str);
            if (expectedErrorText != null)
            {
                Assert.Equal(expectedErrorText, str);
            }
        }

        public static void CheckOk(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        public static void CheckNotFound(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
