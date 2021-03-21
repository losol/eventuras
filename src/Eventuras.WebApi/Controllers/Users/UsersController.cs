using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.Services.Auth;
using Eventuras.Services.Users;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Users
{
    [ApiVersion("3")]
    [Route("v{version:apiVersion}/users")]
    [ApiController]
    [Authorize]
    public class UsersController : Controller
    {
        private readonly IUserRetrievalService _userRetrievalService;

        public UsersController(IUserRetrievalService userRetrievalService)
        {
            _userRetrievalService = userRetrievalService ??
                throw new ArgumentNullException(nameof(userRetrievalService));
        }

        // GET: /v3/users/me
        [HttpGet("me")]
        public async Task<IActionResult> Me(CancellationToken cancellationToken)
        {
            var userId = HttpContext.User.GetUserId();
            var user = await _userRetrievalService.GetUserByIdAsync(userId, cancellationToken);
            return Ok(new UserDto(user));
        }

        // GET: /v3/users
        [HttpGet]
        [Authorize(Policy = Constants.Auth.AdministratorRole)]
        public async Task<PageResponseDto<UserDto>> List(
            [FromQuery] PageQueryDto query,
            CancellationToken cancellationToken)
        {
            var paging = await _userRetrievalService
                .ListUsers(
                    new UserListRequest
                    {
                        Limit = query.Limit,
                        Offset = query.Offset,
                        Filter = new UserFilter
                        {
                            AccessibleOnly = true
                        },
                        OrderBy = UserListOrder.Name,
                        Descending = false
                    },
                    UserRetrievalOptions.Default,
                    cancellationToken);

            return PageResponseDto<UserDto>.FromPaging(
                query, paging, u => new UserDto(u));
        }
    }
}
