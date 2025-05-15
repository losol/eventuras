using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using static Eventuras.Domain.Certificate;

namespace Eventuras.Services.Certificates;

public interface ICertificateRetrievalService
{
    /// <exception cref="Exceptions.NotFoundException">Certificate data not found</exception>
    /// <exception cref="Exceptions.NotAccessibleException">Certificate not accessible</exception>
    Task<Certificate> GetCertificateByIdAsync(int id,
        CertificateRetrievalOptions options = default,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotFoundException">Certificate data not found</exception>
    /// <exception cref="Exceptions.NotAccessibleException">Certificate not accessible</exception>
    Task<List<Certificate>> GetCertificatesByDeliveryStatusAsync(IEnumerable<CertificateDeliveryStatus> deliveryStatuses,
        CertificateRetrievalOptions options = default,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default);

    Task<Paging<Certificate>> ListCertificatesAsync(
        CertificateListRequest request,
        CertificateRetrievalOptions options = default,
        CancellationToken cancellationToken = default);
}
