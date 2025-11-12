using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;

namespace Eventuras.Services.Organizations;

/// <summary>
///     Provides access to the currently active organization.
///     The active org may be defined by the request hostname which should be equal
///     to organization's <see cref="OrganizationHostname" />.
/// </summary>
public interface ICurrentOrganizationAccessorService
{
    /// <returns>Current organization or <c>null</c>, if can't be determined.</returns>
    Task<Organization> GetCurrentOrganizationAsync(
        OrganizationRetrievalOptions options = null,
        CancellationToken cancellationToken = default);

    /// <exception cref="OrgNotSpecifiedException">Organization not configured for the current hostname.</exception>
    Task<Organization> RequireCurrentOrganizationAsync(
        OrganizationRetrievalOptions options = null,
        CancellationToken cancellationToken = default);
}
