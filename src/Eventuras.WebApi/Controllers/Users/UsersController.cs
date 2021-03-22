using System;
using System.Threading;
using System.Threading.Tasks;
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
        private readonly IUserManagementService _userManagementService;

        public UsersController(
            IUserRetrievalService userRetrievalService,
            IUserManagementService userManagementService)
        {
            _userRetrievalService = userRetrievalService ??
                throw new ArgumentNullException(nameof(userRetrievalService));

            _userManagementService = userManagementService ??
                throw new ArgumentNullException(nameof(userManagementService));
        }

        // GET: /v3/users/me
        [HttpGet("me")]
        public async Task<UserDto> Me(CancellationToken cancellationToken)
        {
            var userId = HttpContext.User.GetUserId();
            var user = await _userRetrievalService.GetUserByIdAsync(userId, cancellationToken);
            return new UserDto(user);
        }

        // GET: /v3/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
        {
            var principal = HttpContext.User;
            if (!principal.IsAdmin() && id != principal.GetUserId())
            {
                return Forbid();
            }

            var user = await _userRetrievalService.GetUserByIdAsync(id, cancellationToken);
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
                        OrderBy = UserListOrder.Name
                    },
                    UserRetrievalOptions.Default,
                    cancellationToken);

            return PageResponseDto<UserDto>.FromPaging(
                query, paging, u => new UserDto(u));
        }

        // POST /v3/users
        [HttpPost]
        [Authorize(Policy = Constants.Auth.AdministratorRole)]
        public async Task<IActionResult> CreateNewUser([FromBody] NewUserDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(); // TODO: report validation errors!
            }

            var user = await _userManagementService
                .CreateNewUserAsync(dto.Name, dto.Email, dto.PhoneNumber, cancellationToken);

            return Ok(new UserDto(user));
        }

        // PUT /v3/users/{id}
        [HttpPut("{id}")]
        [Authorize(Policy = Constants.Auth.AdministratorRole)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserFormDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(); // TODO: report validation errors!
            }

            var user = await _userRetrievalService.GetUserByIdAsync(id);
            dto.CopyTo(user);
            await _userManagementService.UpdateUserAsync(user, cancellationToken);

            return Ok(new UserDto(user));
        }
    }
}
