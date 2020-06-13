using System.IO;
using System.Threading.Tasks;

namespace EventManagement.Services.Converto
{
    internal interface IConvertoClient
    {
        Task<string> LoginAsync();

        Task<Stream> Html2PdfAsync(string html, float scale, string format);
    }
}
