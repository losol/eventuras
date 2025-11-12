using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Certificates;

public interface ICertificateIssuingService
{
    /// <summary>
    ///     Creates new certificates for registrants with no existing certificates
    ///     and returns the newly created certificates.
    /// </summary>
    /// <param name="eventInfo">The event to create certificates for.</param>
    /// <exception cref="Exceptions.NotFoundException">Event not found.</exception>
    /// <exception cref="Exceptions.NotAccessibleException">Event is not accessible for update.</exception>
    /// <returns></returns>
    Task<ICollection<Certificate>> CreateCertificatesForEventAsync(EventInfo eventInfo, bool accessControlDone = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Updates all existing certificates for an event with event information.
    ///     and returns the updated certificates
    /// </summary>
    /// <param name="eventInfo">The event to create certificates for.</param>
    /// <exception cref="Exceptions.NotFoundException">Event not found.</exception>
    /// <exception cref="Exceptions.NotAccessibleException">Event is not accessible for update.</exception>
    /// <returns></returns>
    Task<ICollection<Certificate>> UpdateCertificatesForEventAsync(EventInfo eventInfo,
        CancellationToken cancellationToken = default);
}
