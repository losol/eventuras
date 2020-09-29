using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations
{
    public interface IOrganizationMemberManagementService
    {
        Task<OrganizationMember> FindOrganizationMemberAsync(ApplicationUser user, Organization organization = null);

        Task<OrganizationMember> AddToOrganizationAsync(ApplicationUser user, Organization organization = null);

        Task RemoveFromOrganizationAsync(ApplicationUser user, Organization organization = null);
    }
}
