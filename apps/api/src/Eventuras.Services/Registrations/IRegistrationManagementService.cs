#nullable enable

using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations;

/// <summary>
///     The scope of this service is create/update/delete registrations only.
///     For retrieving registrations see <see cref="IRegistrationRetrievalService" />.
/// </summary>
public interface IRegistrationManagementService
{
    /// <exception cref="Exceptions.NotAccessibleException">Not permitted to create the given registration.</exception>
    /// <exception cref="Exceptions.NotFoundException">Event or user not found.</exception>
    /// <exception cref="Exceptions.DuplicateException">Already registered.</exception>
    Task<Registration> CreateRegistrationAsync(
        int eventId,
        string userId,
        RegistrationOptions? options = null,
        CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotAccessibleException">Not permitted to update the given registration.</exception>
    Task UpdateRegistrationAsync(
        Registration registration,
        CancellationToken cancellationToken = default);
}
