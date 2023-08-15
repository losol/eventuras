using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Certificates;

public interface ICertificateDeliveryService
{
    Task SendCertificateAsync(Certificate certificate, CancellationToken cancellationToken = default);
}