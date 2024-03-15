using System.Threading.Tasks;

namespace Eventuras.Services.Views;

public interface IViewRenderService
{
    Task<string> RenderViewToStringAsync(string pageName, object model);
}
