using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Services.Certificates;

public interface ICertificateRenderer
{
    Task<string> RenderToHtmlAsStringAsync(CertificateViewModel viewModel);

    Task<Stream> RenderToPdfAsStreamAsync(CertificateViewModel viewModel);
}