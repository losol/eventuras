using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Users
{
    public interface IUserRetrievalService
    {
        Task<ApplicationUser> GetUserByIdAsync(string userId);

        Task<List<ApplicationUser>> ListAccessibleUsers(UserRetrievalOptions options = null);
    }
}
