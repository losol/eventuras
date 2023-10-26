using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Certificates
{
    public interface ICertificateRetrievalService
    {
        /// <exception cref="Exceptions.NotFoundException">Certificate data not found</exception>
        /// <exception cref="Exceptions.NotAccessibleException">Certificate not accessible</exception>
        Task<Certificate> GetCertificateByIdAsync(int id,
            CertificateRetrievalOptions options = default,
            CancellationToken cancellationToken = default);

        Task<Paging<Certificate>> ListCertificatesAsync(
            CertificateListRequest request,
            CertificateRetrievalOptions options = default,
            CancellationToken cancellationToken = default);
    }
}
