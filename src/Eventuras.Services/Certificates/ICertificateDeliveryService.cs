using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Certificates
{
    public interface ICertificateDeliveryService
    {
        Task SendCertificateAsync(
            Certificate certificate,
            CancellationToken cancellationToken = default);
    }
}
