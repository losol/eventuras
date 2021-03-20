using System;
using System.Threading.Tasks;
using Eventuras.Services.Auth;
using Eventuras.Services.Users;
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
        public async Task<IActionResult> Me()
        {
            var userId = HttpContext.User.GetUserId();
            var user = await _userRetrievalService.GetUserByIdAsync(userId);
            return Ok(new UserDto(user));
        }
    }
}
