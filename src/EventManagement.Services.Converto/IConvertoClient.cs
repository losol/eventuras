using System.IO;
using System.Threading.Tasks;

namespace EventManagement.Services.Converto
{
    public interface IConvertoClient
    {
        Task<Stream> Html2PdfAsync(string html, float scale, string format);
    }
}
