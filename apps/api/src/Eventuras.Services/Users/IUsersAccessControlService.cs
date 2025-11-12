using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;

namespace Eventuras.Services.Users;

public interface IUserAccessControlService
{
    /// <summary>
    ///     Checks if the given user has owner or admin access.
    /// </summary>
    /// <param name="user">The user to check access for.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    /// <exception cref="NotAccessibleException">Thrown if the user does not have access.</exception>
    Task CheckOwnerOrAdminAccessAsync(ApplicationUser user, CancellationToken cancellationToken);
}
