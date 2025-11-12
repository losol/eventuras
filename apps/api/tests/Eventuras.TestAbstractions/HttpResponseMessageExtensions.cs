using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.TestAbstractions;

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

    public static async Task<JsonElement> AsTokenAsync(this HttpResponseMessage response)
    {
        response.CheckOk();
        var content = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(content);
        return document.RootElement.Clone();
    }

    public static async Task<JsonElement> AsArrayAsync(this HttpResponseMessage response)
    {
        response.CheckOk();
        var content = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(content);
        return document.RootElement.Clone();
    }

    public static HttpResponseMessage CheckOk(this HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return response;
    }

    public static async Task<TContent> CheckOkAndGetContentAsync<TContent>(
        this HttpResponseMessage response,
        CancellationToken cancellationToken = default)
    {
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var options = new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() },
            PropertyNameCaseInsensitive = true,
        };
        return await response.Content.ReadFromJsonAsync<TContent>(options, cancellationToken);
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
