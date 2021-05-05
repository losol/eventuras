using Eventuras.Services.Users;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Users
{
    public class UsersQueryDto : PageQueryDto
    {
        [FromQuery]
        public string Query { get; set; }

        public UserListOrder Order { get; set; } = UserListOrder.Name;

        public bool Descending { get; set; }

        public UserFilter ToUserFilter()
        {
            return new UserFilter
            {
                Query = Query,
            };
        }
    }
}
