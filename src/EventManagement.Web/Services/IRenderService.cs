using System.Threading.Tasks;

namespace losol.EventManagement.Web.Services
{
    public interface IRenderService
    {
        Task<string> RenderViewToStringAsync(string pageName, object model);
    }
}
