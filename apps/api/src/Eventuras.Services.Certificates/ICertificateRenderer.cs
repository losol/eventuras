using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Certificates;

public interface ICertificateRenderer
{
    Task<string> RenderToHtmlAsStringAsync(
        CertificateViewModel viewModel,
        string locale,
        CancellationToken cancellationToken = default);

    Task<Stream> RenderToPdfAsStreamAsync(
        CertificateViewModel viewModel,
        string locale,
        CancellationToken cancellationToken = default);
}
