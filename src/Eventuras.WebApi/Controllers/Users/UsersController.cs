using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Users;
using Eventuras.WebApi.Config;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

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
        private readonly ILogger<UsersController> _logger;
        private readonly AuthSettings _authSettings;

        public UsersController(
            IUserRetrievalService userRetrievalService,
            IUserManagementService userManagementService,
            ILogger<UsersController> logger,
            IOptions<AuthSettings> authSettingsOptions)
        {
            _userRetrievalService = userRetrievalService ?? throw new ArgumentNullException(nameof(userRetrievalService));
            _userManagementService = userManagementService ?? throw new ArgumentNullException(nameof(userManagementService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _authSettings = authSettingsOptions.Value;
        }

        // GET: /v3/users/me
        /// <summary>
        /// Gets information about the current user. Creates a new user if no user with the email exists.
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> Me(CancellationToken cancellationToken)
        {
            var emailClaim = HttpContext.User.GetEmail();
            var nameClaim = HttpContext.User.GetName();
            var phoneClaim = HttpContext.User.GetMobilePhone();

            if (_authSettings.EnablePiiLogging)
            {
                _logger.LogInformation($"Getting user info for email: {emailClaim}, name: {nameClaim}, phone: {phoneClaim} .");
            }

            if (string.IsNullOrEmpty(emailClaim))
            {
                _logger.LogWarning("No email provided for user to in this request.");
                return BadRequest("No email provided.");
            }

            ApplicationUser user;

            try { user = await _userRetrievalService.GetUserByEmailAsync(emailClaim, null, cancellationToken); }
            catch (Services.Exceptions.NotFoundException)
            {
                if (_authSettings.EnablePiiLogging)
                {
                    _logger.LogInformation($"No user found with email {emailClaim}. Creating new user.");
                }
                user = await _userManagementService.CreateNewUserAsync(nameClaim,
                    emailClaim,
                    phoneClaim,
                    cancellationToken);
            }

            return Ok(new UserDto(user));

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

            var user = await _userRetrievalService.GetUserByIdAsync(id, null, cancellationToken);
            return Ok(new UserDto(user));

        }
        // GET: /v3/users
        [HttpGet]
        [Authorize(Policy = Constants.Auth.AdministratorRole)]
        public async Task<IActionResult> List(
       [FromQuery] UsersQueryDto request,
       CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var principal = HttpContext.User;
            if (!principal.IsAdmin())
            {
                return Forbid();
            }

            var paging = await _userRetrievalService
            .ListUsers(
                new UserListRequest
                {
                    Filter = request.ToUserFilter(),
                    Limit = request.Limit,
                    Offset = request.Offset,
                    OrderBy = request.Order,
                    Descending = request.Descending
                },
                UserRetrievalOptions.Default,
                cancellationToken);

            var pageResponse = PageResponseDto<UserDto>.FromPaging(
                request, paging, u => new UserDto(u));

            return Ok(pageResponse);
        }


        // POST /v3/users
        [HttpPost]
        [Authorize(Policy = Constants.Auth.AdministratorRole)]
        public async Task<IActionResult> CreateNewUser([FromBody] NewUserDto dto, CancellationToken cancellationToken)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var user = await _userManagementService
            .CreateNewUserAsync(dto.Name, dto.Email, dto.PhoneNumber, cancellationToken);

            return Ok(new UserDto(user));

        }

        // PUT /v3/users/{id}
        [HttpPut("{id}")]
        [Authorize(Policy = Constants.Auth.AdministratorRole)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserFormDto dto,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var user = await _userRetrievalService.GetUserByIdAsync(id, null, cancellationToken);
            dto.CopyTo(user);

            await _userManagementService.UpdateUserAsync(user, cancellationToken);
            return Ok(new UserDto(user));


        }
    }
}
