using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Users
{
    public interface IUserRetrievalService
    {
        Task<ApplicationUser> GetUserByIdAsync(string userId);

        Task<List<ApplicationUser>> ListUsers(UserFilter filter = null, UserRetrievalOptions options = null);
    }

    public class UserFilter
    {
        /// <summary>
        /// Whether to load only users accessible to the currently signed
        /// in user via org membership.
        /// </summary>
        public bool AccessibleToOrgOnly { get; set; }
    }
}
