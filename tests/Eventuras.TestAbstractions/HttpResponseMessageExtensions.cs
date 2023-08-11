using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Eventuras.TestAbstractions
{
    public static class HttpResponseMessageExtensions
    {
        public static void CheckBadRequest(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        public static async Task CheckBadRequestAsync(this HttpResponseMessage response, string expectedErrorText)
        {
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var str = await response.Content.ReadAsStringAsync();
            Assert.NotEmpty(str);
            if (expectedErrorText != null)
            {
                Assert.Contains(expectedErrorText, str);
            }
        }

        public static async Task<JToken> AsTokenAsync(this HttpResponseMessage response)
        {
            response.CheckOk();
            var content = await response.Content.ReadAsStringAsync();
            return JToken.Parse(content);
        }

        public static async Task<JArray> AsArrayAsync(this HttpResponseMessage response)
        {
            response.CheckOk();
            var content = await response.Content.ReadAsStringAsync();
            return JArray.Parse(content);
        }

        public static HttpResponseMessage CheckOk(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            return response;
        }

        public static HttpResponseMessage CheckStatusCode(this HttpResponseMessage response, params HttpStatusCode[] allowedStatuses)
        {
            Assert.Contains(response.StatusCode, allowedStatuses);
            return response;
        }

        public static HttpResponseMessage CheckSuccess(this HttpResponseMessage response)
        {
            Assert.InRange((int)response.StatusCode, 200, 299);
            return response;
        }

        public static HttpResponseMessage CheckNotFound(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            return response;
        }

        public static HttpResponseMessage CheckUnauthorized(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            return response;
        }

        public static HttpResponseMessage CheckForbidden(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            return response;
        }

        public static HttpResponseMessage CheckConflict(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            return response;
        }
    }
}