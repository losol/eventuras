using System.Collections.Generic;
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

    /// <exception cref="Exceptions.ArgumentNullException">One of certificates is null.</exception>
    /// <exception cref=Exceptions.InvalidOperationException">Certificates is null or empty.</exception>
    /// <exception cref="Exceptions.NotAccessibleException">One of certificates is not accessible for read.</exception>
    Task CheckCertificatesReadAccessAsync(
        List<Certificate> certificates,
        CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotAccessibleException">Certificate is not accessible for update.</exception>
    Task CheckCertificateUpdateAccessAsync(
        Certificate certificate,
        CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.ArgumentNullException">One of certificates is null.</exception>
    /// <exception cref=Exceptions.InvalidOperationException">Certificates is null or empty.</exception>
    /// <exception cref="Exceptions.NotAccessibleException">One of certificates is not accessible for update.</exception>
    Task CheckCertificatesUpdateAccessAsync(
        List<Certificate> certificates,
        CancellationToken cancellationToken = default);
}
