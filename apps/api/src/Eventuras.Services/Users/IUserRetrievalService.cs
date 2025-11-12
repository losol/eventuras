using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Users;

public interface IUserRetrievalService
{
    /// <exception cref="Exceptions.NotFoundException">User not found.</exception>
    Task<ApplicationUser> GetUserByIdAsync(
        string userId,
        UserRetrievalOptions options = null,
        CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotFoundException">User not found.</exception>
    Task<ApplicationUser> GetUserByEmailAsync(
        string email,
        UserRetrievalOptions options = null,
        CancellationToken cancellationToken = default);

    Task<Paging<ApplicationUser>> ListUsers(
        UserListRequest request,
        UserRetrievalOptions options = null,
        CancellationToken cancellationToken = default);
}

public class UserFilter
{
    /// <summary>
    ///     Whether to load only users accessible to the currently signed
    ///     in user via org membership.
    /// </summary>
    public bool AccessibleOnly { get; set; }

    /// <summary>
    ///     Whether to select archived users, too.
    /// </summary>
    public bool IncludeArchived { get; set; }

    /// <summary>
    ///     Match users by name, phone or email containing the specified string.
    /// </summary>
    public string Query { get; set; }

    /// <summary>
    ///     Organization to filter users by.
    /// </summary>
    public int? OrganizationId { get; set; }

    public OrganizationMembershipFilter OrganizationMembership { get; set; } = new();

    public class OrganizationMembershipFilter
    {
        public int OrganizationId { get; set; }
    }
}
