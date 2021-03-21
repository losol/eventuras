using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Users
{
    public interface IUserRetrievalService
    {
        /// <exception cref="Exceptions.NotFoundException">User not found.</exception>
        /// <exception cref="Exceptions.NotAccessibleException">User not accessible in the context of the current org.</exception>
        Task<ApplicationUser> GetUserByIdAsync(
            string userId,
            CancellationToken cancellationToken = default);

        Task<Paging<ApplicationUser>> ListUsers(
            UserListRequest request,
            UserRetrievalOptions options = null,
            CancellationToken cancellationToken = default);
    }

    public class UserFilter
    {
        /// <summary>
        /// Whether to load only users accessible to the currently signed
        /// in user via org membership.
        /// </summary>
        public bool AccessibleOnly { get; set; }

        /// <summary>
        /// Whether to select archived users, too.
        /// </summary>
        public bool InlcudeArchived { get; set; }
    }
}
