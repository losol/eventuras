using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Certificates
{
    public interface ICertificateAccessControlService
    {
        /// <exception cref="Exceptions.NotAccessibleException">Certificate is not accessible for read.</exception>
        Task CheckCertificateReadAccessAsync(
            Certificate certificate,
            CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotAccessibleException">Certificate is not accessible for update.</exception>
        Task CheckCertificateUpdateAccessAsync(
            Certificate certificate,
            CancellationToken cancellationToken = default);
    }
}
