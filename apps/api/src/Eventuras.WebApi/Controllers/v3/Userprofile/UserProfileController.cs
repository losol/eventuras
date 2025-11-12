using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Users;
using Eventuras.WebApi.Config;
using Eventuras.WebApi.Controllers.v3.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eventuras.WebApi.Controllers.v3.Userprofile;

[ApiVersion("3")]
[Route("v{version:apiVersion}/userprofile")]
[ApiController]
[Authorize]
public class UserProfileController : Controller
{
    private readonly AuthSettings _authSettings;
    private readonly IMemoryCache _cache;
    private readonly ILogger<UserProfileController> _logger;
    private readonly IUserManagementService _userManagementService;
    private readonly IUserRetrievalService _userRetrievalService;

    public UserProfileController(
        IUserRetrievalService userRetrievalService,
        IUserManagementService userManagementService,
        IMemoryCache cache,
        ILogger<UserProfileController> logger,
        IOptions<AuthSettings> authSettingsOptions)
    {
        _userRetrievalService = userRetrievalService ?? throw new ArgumentNullException(nameof(userRetrievalService));
        _userManagementService =
            userManagementService ?? throw new ArgumentNullException(nameof(userManagementService));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _authSettings = authSettingsOptions.Value;
    }

    // GET: /v3/userprofile
    /// <summary>
    ///     Gets information about the current user. Creates a new user if no user with the email exists.
    /// </summary>
    [HttpGet]
    public async Task<UserDto> Me(CancellationToken cancellationToken)
    {
        var emailClaim = HttpContext.User.GetEmail();
        var phoneClaim = HttpContext.User.GetMobilePhone();

        if (_authSettings.EnablePiiLogging)
        {
            _logger.LogInformation($"Getting user info for email: {emailClaim}, phone: {phoneClaim} .");
        }

        if (string.IsNullOrEmpty(emailClaim))
        {
            _logger.LogWarning("No email provided for user to in this request.");
            throw new BadHttpRequestException("No email provided for user to in this request.");
        }

        ApplicationUser user;

        try
        {
            user = await _userRetrievalService.GetUserByEmailAsync(emailClaim, null, cancellationToken);
        }
        catch (NotFoundException)
        {
            if (_authSettings.EnablePiiLogging)
            {
                _logger.LogInformation($"No user found with email {emailClaim}. Creating new user.");
            }
            else
            {
                _logger.LogInformation("No user found with email. Creating new user.");
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

    // PUT /v3/userprofile
    [HttpPut]
    public async Task<UserDto> UpdateUser([FromBody] UserFormDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            throw new BadHttpRequestException($"Invalid request body. {ModelState.FormatErrors()}");
        }

        var userId = HttpContext.User.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            throw new NotAccessibleException("User ID not found in authentication context.");
        }

        var user = await _userRetrievalService.GetUserByIdAsync(userId, null, cancellationToken);
        dto.CopyTo(user);

        await _userManagementService.UpdateUserAsync(user, cancellationToken);
        return new UserDto(user);
    }
}
