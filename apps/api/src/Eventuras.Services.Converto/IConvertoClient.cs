using System.IO;
using System.Threading.Tasks;
using Eventuras.Libs.Pdf;

namespace Eventuras.Services.Converto;

internal interface IConvertoClient
{
    Task<Stream> GeneratePdfFromHtmlAsync(string html, float scale, PaperSize paperSize = PaperSize.A4);
}
