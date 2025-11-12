using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Organizations;

public interface IOrganizationMemberManagementService
{
    /// <summary>
    ///     Get all members of the given organization.
    /// </summary>
    /// <param name="organization">Organization to get members for.</param>
    /// <returns>Array of members.</returns>
    /// <exception cref="Exceptions.NotFoundException">Organization with the given id was not found.</exception>
    /// <exception cref="Exceptions.NotAccessibleException">
    ///     Organization is not accessible for the the currently logged in
    ///     user.
    /// </exception>
    /// <returns>Array of members.</returns>
    Task<OrganizationMember[]> GetOrganizationMembersAsync(
        Organization organization = null,
        OrganizationMemberRetrievalOptions options = null);

    /// <summary>
    ///     Find org member record for the given app user. If no <c>organization</c> is passed,
    ///     then returns member record for the current organization (see <see cref="ICurrentOrganizationAccessorService" />).
    /// </summary>
    /// <param name="user">User to find membership for.</param>
    /// <param name="organization">Organization to find membership for, or <c>null</c> for current org.</param>
    /// <param name="options">Optional load params.</param>
    /// <returns>Org membership record or <c>null</c> if not found.</returns>
    Task<OrganizationMember> FindOrganizationMemberAsync(
        ApplicationUser user,
        Organization organization = null,
        OrganizationMemberRetrievalOptions options = null);

    /// <summary>
    ///     Ensures org member record for the given app user. If no <c>organization</c> is passed,
    ///     then returns member record for the current organization (see <see cref="ICurrentOrganizationAccessorService" />).
    /// </summary>
    /// <param name="user">User to create/retrieve membership for.</param>
    /// <param name="organization">Organization to find membership for, or <c>null</c> for current org.</param>
    /// <param name="options">Optional load params.</param>
    /// <returns>Org membership record or <c>null</c> if not found.</returns>
    Task<OrganizationMember> AddToOrganizationAsync(
        ApplicationUser user,
        Organization organization = null,
        OrganizationMemberRetrievalOptions options = null);

    /// <summary>
    ///     Removes membership for the given user, if any. If no org is passed,
    ///     then removes from the current org.
    /// </summary>
    /// <param name="user">User to which membership is to be removed.</param>
    /// <param name="organization">Organization to find membership for, or <c>null</c> for current org.</param>
    Task RemoveFromOrganizationAsync(
        ApplicationUser user,
        Organization organization = null);
}
