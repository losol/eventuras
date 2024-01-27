using System.Threading.Tasks;

namespace Eventuras.Services.Organizations
{
    public interface IOrganizationMemberRolesManagementService
    {
        Task UpdateOrganizationMemberRolesAsync(int memberId, string[] roles);
    }
}
