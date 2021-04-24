using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Users
{
    public interface IUserRetrievalService
    {
        /// <exception cref="Exceptions.NotFoundException">User not found.</exception>
        Task<ApplicationUser> GetUserByIdAsync(
            string userId,
            CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotFoundException">User not found.</exception>
        Task<ApplicationUser> GetUserByEmailAsync(
            string email,
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
        public bool IncludeArchived { get; set; }
    }
}
