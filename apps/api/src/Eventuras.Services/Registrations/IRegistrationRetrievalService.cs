using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Servcies.Registrations;
using static Eventuras.Services.Registrations.RegistrationRetrievalService;

namespace Eventuras.Services.Registrations;

public interface IRegistrationRetrievalService
{
    /// <exception cref="Exceptions.NotFoundException">Registration with the given id was not found.</exception>
    /// <exception cref="Exceptions.NotAccessibleException">Registration is not accessible for the the currently logged in user.</exception>
    Task<Registration> GetRegistrationByIdAsync(int id,
        RegistrationRetrievalOptions options = default,
        CancellationToken cancellationToken = default);

    Task<Registration> FindRegistrationAsync(
        RegistrationFilter filter,
        RegistrationRetrievalOptions options = default,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets aggregated product information for a registration.
    /// Groups all order lines by product and variant, summing quantities.
    /// </summary>
    Task<List<RegistrationProductDto>> GetRegistrationProductsAsync(
        Registration registration,
        CancellationToken cancellationToken = default);

    Task<Paging<Registration>> ListRegistrationsAsync(
        RegistrationListRequest request,
        RegistrationRetrievalOptions options = default,
        CancellationToken cancellationToken = default);

    Task<RegistrationStatistics> GetRegistrationStatisticsAsync(int eventId, CancellationToken cancellationToken);

}
