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
                Assert.Equal(expectedErrorText, str);
            }
        }

        public static async Task<JToken> AsTokenAsync(this HttpResponseMessage response)
        {
            response.CheckOk();
            var content = await response.Content.ReadAsStringAsync();
            return JToken.Parse(content);
        }

        public static async Task<JToken> AsArrayAsync(this HttpResponseMessage response)
        {
            response.CheckOk();
            var content = await response.Content.ReadAsStringAsync();
            return JArray.Parse(content);
        }

        public static void CheckOk(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        public static void CheckNotFound(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        public static void CheckUnauthorized(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        public static void CheckForbidden(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        public static void CheckConflict(this HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        }
    }
}
