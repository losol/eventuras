#nullable enable

using System;
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
        Guid userId,
        RegistrationOptions? options = null,
        CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotAccessibleException">Not permitted to update the given registration.</exception>
    /// <remarks>
    ///     Emits <c>registration.status.changed</c> and <c>registration.type.changed</c>
    ///     BusinessEvents for any detected delta. The caller no longer needs to
    ///     track which fields changed or invoke the audit log.
    /// </remarks>
    Task UpdateRegistrationAsync(
        Registration registration,
        CancellationToken cancellationToken = default);

    /// <summary>Sets a registration's status to Cancelled and emits the audit event.</summary>
    /// <exception cref="Exceptions.NotFoundException">Registration not found.</exception>
    /// <exception cref="Exceptions.NotAccessibleException">Not permitted to cancel the given registration.</exception>
    Task<Registration> CancelRegistrationAsync(
        int id,
        CancellationToken cancellationToken = default);
}
