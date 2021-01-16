using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Registrations
{
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

        Task<Paging<Registration>> ListRegistrationsAsync(
            RegistrationListRequest request,
            RegistrationRetrievalOptions options = default,
            CancellationToken cancellationToken = default);
    }
}
