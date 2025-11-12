using System.Threading.Tasks;

namespace Eventuras.Services.Organizations;

public interface IOrganizationAccessControlService
{
    /// <summary>
    ///     Checks whether the authenticated user has access to obtain the specified organization info.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">The given org is not accessible for read.</exception>
    Task CheckOrganizationReadAccessAsync(int organizationId);

    /// <summary>
    ///     Checks whether the authenticated user has access to update the specified organization.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">The given org is not accessible for update.</exception>
    Task CheckOrganizationUpdateAccessAsync(int organizationId);
}
