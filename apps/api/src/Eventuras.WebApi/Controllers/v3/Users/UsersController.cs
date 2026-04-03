using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Users;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.v3.Users;

[ApiVersion("3")]
[Route("v{version:apiVersion}/users")]
[ApiController]
[Authorize]
public class UsersController : Controller
{
    private readonly ILogger<UsersController> _logger;
    private readonly IUserManagementService _userManagementService;
    private readonly IUserRetrievalService _userRetrievalService;

    public UsersController(
        IUserRetrievalService userRetrievalService,
        IUserManagementService userManagementService,
        ILogger<UsersController> logger)
    {
        _userRetrievalService = userRetrievalService ?? throw new ArgumentNullException(nameof(userRetrievalService));
        _userManagementService =
            userManagementService ?? throw new ArgumentNullException(nameof(userManagementService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // GET: /v3/users/{id}
    [HttpGet("{id}")]
    public async Task<UserDto> Get(Guid id, CancellationToken cancellationToken)
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
        var principal = HttpContext.User;
        var userId = principal.GetUserId();

        _logger.LogDebug(
            "User search initiated by {UserId}. QueryLength: {QueryLength}, Limit: {Limit}, Offset: {Offset}",
            userId,
            request.Query?.Length ?? 0,
            request.Limit,
            request.Offset);

        if (!ModelState.IsValid)
        {
            _logger.LogWarning(
                "ListUsers called with invalid query parameters by {UserId}",
                userId);
            throw new BadHttpRequestException("Invalid query parameters.");
        }

        if (!principal.IsAdmin())
        {
            _logger.LogWarning(
                "Unauthorized user {UserId} tried to access users list.",
                userId);
            throw new UnauthorizedAccessException("You are not authorized to access this resource.");
        }

        var startTime = DateTime.UtcNow;

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
                new UserRetrievalOptions { IncludeOrgMembership = request.IncludeOrgMembership },
                cancellationToken);

        var duration = DateTime.UtcNow - startTime;

        _logger.LogDebug(
            "User search completed for {UserId}. Results: {Count}/{Total}, Duration: {Duration}ms",
            userId,
            paging.Data.Length,
            paging.TotalRecords,
            duration.TotalMilliseconds);

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

        _logger.LogDebug("Creating new user.");
        var user = await _userManagementService
            .CreateNewUserAsync(dto.Email, dto.PhoneNumber, cancellationToken);

        _logger.LogDebug("Updating user with additional information.");
        dto.CopyTo(user);
        await _userManagementService.UpdateUserAsync(user, cancellationToken);

        return new UserDto(user);
    }

    // PUT /v3/users/{id}
    [HttpPut("{id}")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    public async Task<UserDto> UpdateUser(Guid id, [FromBody] UserFormDto dto,
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
