using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Users;

public static class UserRetrievalServiceExtensions
{
    public static async Task<List<ApplicationUser>> ListUsersAsync(
        this IUserRetrievalService userRetrievalService) =>
        (await PageReader<ApplicationUser>.ReadAllAsync((offset, limit, token) => userRetrievalService
            .ListUsers(new UserListRequest { Limit = limit, Offset = offset }, UserRetrievalOptions.Default, token)))
        .ToList();
}
