using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Services.Converto;

internal interface IConvertoClient
{
    Task<Stream> Html2PdfAsync(string html, float scale, string format);
}
