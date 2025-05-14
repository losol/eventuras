using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Certificates;

public interface ICertificateDeliveryService
{
    Task QueueCertificateForDeliveryAsync(int certificateId, CancellationToken cancellationToken = default);

    Task SendCertificateAsync(
        int certificateId,
        bool accessControlDone,
        CancellationToken cancellationToken);

    Task SendCertificateAsync(
        Certificate certificate,
        CancellationToken cancellationToken);
}
