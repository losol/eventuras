using System.Threading.Tasks;
using RestSharp;

namespace losol.EventManagement.Services.Extensions
{
    internal static class RestClientExtensions
    {
        internal static async Task<RestResponse> ExecuteAsync(this RestClient client, RestRequest request)
        {
            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = client.ExecuteAsync(request, r => taskCompletion.SetResult(r));
            return (await taskCompletion.Task) as RestResponse;
        }

        internal static async Task<RestResponse<T>> ExecuteAsync<T>(this RestClient client, RestRequest request) where T: new()
        {
            TaskCompletionSource<IRestResponse> taskCompletion = new TaskCompletionSource<IRestResponse>();
            RestRequestAsyncHandle handle = client.ExecuteAsync<T>(request, r => taskCompletion.SetResult(r));
            return (await taskCompletion.Task) as RestResponse<T>;
        }
    }
}
