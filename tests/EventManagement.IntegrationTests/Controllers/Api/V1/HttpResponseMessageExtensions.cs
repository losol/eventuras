using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace losol.EventManagement.IntegrationTests.Controllers.Api.V1
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
    }
}
