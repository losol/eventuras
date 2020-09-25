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
    }
}
