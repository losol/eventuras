using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Users;
using Eventuras.WebApi.Config;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eventuras.WebApi.Controllers.v3.Users;

[ApiVersion("3")]
[Route("v{version:apiVersion}/users")]
[ApiController]
[Authorize]
public class UsersController : Controller
{
    private readonly IUserRetrievalService _userRetrievalService;
    private readonly IUserManagementService _userManagementService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<UsersController> _logger;
    private readonly AuthSettings _authSettings;

    public UsersController(
        IUserRetrievalService userRetrievalService,
        IUserManagementService userManagementService,
        IMemoryCache cache,
        ILogger<UsersController> logger,
        IOptions<AuthSettings> authSettingsOptions)
    {
        _userRetrievalService = userRetrievalService ?? throw new ArgumentNullException(nameof(userRetrievalService));
        _userManagementService = userManagementService ?? throw new ArgumentNullException(nameof(userManagementService));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _authSettings = authSettingsOptions.Value;
    }

    // GET: /v3/users/me
    /// <summary>
    /// Gets information about the current user. Creates a new user if no user with the email exists.
    /// </summary>
    [Obsolete("use /v3/userprofile instead")]
    [HttpGet("me")]
    public async Task<UserDto> Me(CancellationToken cancellationToken)
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
            throw new BadHttpRequestException("No email provided for user to in this request.");
        }

        ApplicationUser user;

        try
        { user = await _userRetrievalService.GetUserByEmailAsync(emailClaim, null, cancellationToken); }
        catch (Services.Exceptions.NotFoundException)
        {
            if (_authSettings.EnablePiiLogging)
            {
                _logger.LogInformation($"No user found with email {emailClaim}. Creating new user.");
            }
            else
            {
                _logger.LogInformation($"No user found with email. Creating new user.");
            }

            user = await _userManagementService.CreateNewUserAsync(
                emailClaim,
                phoneClaim,
                cancellationToken);

            // Invalidate user cache for this email to ensure new identity is added
            _cache.Remove(DbUserClaimTransformation.GetMemoryCacheKey(emailClaim));

        }

        return new UserDto(user);

    }

    // GET: /v3/users/{id}
    [HttpGet("{id}")]
    public async Task<UserDto> Get(string id, CancellationToken cancellationToken)
    {
        var principal = HttpContext.User;
        if (!principal.IsAdmin() && id != principal.GetUserId())
        {
            throw new NotAccessibleException("You are not authorized to access this resource.");
        }

        var user = await _userRetrievalService.GetUserByIdAsync(id, null, cancellationToken);
        return new UserDto(user);

    }
    // GET: /v3/users
    [HttpGet]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    public async Task<PageResponseDto<UserDto>> List(
   [FromQuery] UsersQueryDto request,
   CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogInformation("ListUsers called with invalid query parameters: {query}", request);
            throw new BadHttpRequestException("Invalid query parameters.");
        }

        var principal = HttpContext.User;
        if (!principal.IsAdmin())
        {
            _logger.LogWarning("User {userId} tried to access users list.", principal.GetUserId());
            throw new UnauthorizedAccessException("You are not authorized to access this resource.");
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
            new UserRetrievalOptions() { IncludeOrgMembership = request.IncludeOrgMembership },
            cancellationToken);

        return PageResponseDto<UserDto>.FromPaging(
            request, paging, u => new UserDto(u));
    }


    // POST /v3/users
    [HttpPost]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    public async Task<UserDto> CreateNewUser([FromBody] UserFormDto dto, CancellationToken cancellationToken)
    {

        if (!ModelState.IsValid)
        {
            throw new BadHttpRequestException($"Invalid request body. {ModelState.FormatErrors()}");
        }

        _logger.LogInformation("Creating new user with email {email}.", dto.Email);
        var user = await _userManagementService
        .CreateNewUserAsync(dto.Email, dto.PhoneNumber, cancellationToken);

        _logger.LogInformation("Update user with additional information.");
        dto.CopyTo(user);
        await _userManagementService.UpdateUserAsync(user, cancellationToken);

        return new UserDto(user);

    }

    // PUT /v3/users/{id}
    [HttpPut("{id}")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    public async Task<UserDto> UpdateUser(string id, [FromBody] UserFormDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            throw new BadHttpRequestException($"Invalid request body. {ModelState.FormatErrors()}");
        }

        var user = await _userRetrievalService.GetUserByIdAsync(id, null, cancellationToken);
        dto.CopyTo(user);

        await _userManagementService.UpdateUserAsync(user, cancellationToken);
        return new UserDto(user);
    }
}
