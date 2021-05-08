using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Organizations
{
    public interface IOrganizationRetrievalService
    {
        /// <summary>
        /// List all organizations accessible by the signed in user.
        /// Note: super admin can see all orgs.
        /// </summary>
        /// <returns>Empty list, if not signed in.</returns>
        Task<List<Organization>> ListOrganizationsAsync(
            OrganizationFilter filter = null,
            OrganizationRetrievalOptions options = null);

        /// <exception cref="Exceptions.NotAccessibleException">Not signed in or has no access to the given org.</exception>
        Task<Organization> GetOrganizationByIdAsync(int id, OrganizationRetrievalOptions options = null);
    }
}
