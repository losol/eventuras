using System.Threading.Tasks;

namespace Losol.Communication.Email.Services.Render
{
    public interface IRazorViewToStringService
    {
        Task<string> RenderViewToStringAsync<TModel>(string viewName, TModel model);
    }
}