using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Certificates;

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

    /// <summary>
    ///     Filters the given query to only return certificates accessible by the current user.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">Anonymous access is not permitted.</exception>
    Task<IQueryable<Certificate>> AddAccessFilterAsync(
        IQueryable<Certificate> query,
        CancellationToken cancellationToken = default);
}
