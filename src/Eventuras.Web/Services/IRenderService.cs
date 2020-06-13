using System.Threading.Tasks;

namespace Eventuras.Web.Services
{
    public interface IRenderService
    {
        Task<string> RenderViewToStringAsync(string pageName, object model);
    }
}
