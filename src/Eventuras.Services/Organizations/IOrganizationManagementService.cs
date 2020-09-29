using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations
{
    public interface IOrganizationManagementService
    {
        /// <summary>
        /// Create new org is available to <see cref="Roles.SuperAdmin"/> role only.
        /// </summary>
        /// <param name="organization">Not <c>null</c></param>
        /// <exception cref="System.AccessViolationException">Not a <see cref="Roles.SuperAdmin"/>.</exception>
        Task CreateNewOrganizationAsync(Organization organization);

        /// <summary>
        /// Update org is available to <see cref="Roles.SuperAdmin"/> role only.
        /// </summary>
        /// <param name="organization">Not <c>null</c></param>
        /// <exception cref="System.AccessViolationException">Not a <see cref="Roles.SuperAdmin"/>.</exception>
        Task UpdateOrganizationAsync(Organization organization);

        /// <param name="id">Organization id.</param>
        /// <param name="hostnames">Not null. If empty, all org hostnames will be removed.</param>
        /// <exception cref="System.InvalidOperationException">Organization not found or was deleted.</exception>
        /// <exception cref="DuplicateOrganizationHostnameException">Duplicate hostname.</exception>
        Task UpdateOrganizationHostnames(int id, string[] hostnames);

        Task DeleteOrganizationAsync(int id);
    }
}
