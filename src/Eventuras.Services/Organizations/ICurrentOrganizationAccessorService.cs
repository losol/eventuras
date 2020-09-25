using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations
{
    /// <summary>
    /// Provides access to the currently active organization.
    /// The active org may be defined by the request hostname which should be equal
    /// to organization's <see cref="Organization.EventurasHostname"/>.
    /// </summary>
    public interface ICurrentOrganizationAccessorService
    {
        /// <returns>Current organization or <c>null</c>, if can't be determined.</returns>
        Task<Organization> GetCurrentOrganizationAsync();
    }
}
