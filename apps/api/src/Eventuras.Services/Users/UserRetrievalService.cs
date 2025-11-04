using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Users;

internal class UserRetrievalService : IUserRetrievalService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<UserRetrievalService> _logger;

    public UserRetrievalService(
        ApplicationDbContext context,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<UserRetrievalService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ApplicationUser> GetUserByIdAsync(
        string userId,
        UserRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User id argument must not be empty", nameof(userId));
        }

        var user = await _context.ApplicationUsers
            .AsNoTracking()
            .UseOptions(options ?? UserRetrievalOptions.Default)
            .SingleOrDefaultAsync(u => u.Id == userId, cancellationToken: cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"User {userId} not found.");
        }

        return user;
    }

    public async Task<ApplicationUser> GetUserByEmailAsync(
        string email,
        UserRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("User email argument must not be empty", nameof(email));
        }

        var user = await _context.ApplicationUsers
            .AsNoTracking()
            .UseOptions(options ?? UserRetrievalOptions.Default)
            .SingleOrDefaultAsync(u => u.NormalizedEmail == email.ToUpper(), cancellationToken: cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"User with email {email} not found.");
        }

        return user;
    }

    public async Task<Paging<ApplicationUser>> ListUsers(
        UserListRequest request,
        UserRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        options ??= UserRetrievalOptions.Default;

        _logger.LogDebug(
            "Building user query. HasFilter: {HasFilter}, OrderBy: {OrderBy}, Descending: {Descending}",
            !string.IsNullOrWhiteSpace(request.Filter?.Query),
            request.OrderBy,
            request.Descending);

        var query = _context.Users
            .AsNoTracking()
            .UseOptions(options)
            .AddFilter(request.Filter, _logger)
            .AddOrder(request.OrderBy, request.Descending);

        if (request.Filter.OrganizationId.HasValue)
        {
            _logger.LogDebug(
                "Filtering users by OrganizationId: {OrganizationId}",
                request.Filter.OrganizationId.Value);
            query = query.Where(u => u.OrganizationMembership.Any(om => om.OrganizationId == request.Filter.OrganizationId.Value));
        }

        if (request.Filter.AccessibleOnly)
        {
            var user = _httpContextAccessor.HttpContext.User;
            if (!user.IsAdmin())
            {
                _logger.LogWarning("Non-admin user attempted to list users with AccessibleOnly filter");
                return Paging.Empty<ApplicationUser>();
            }

            if (!user.IsSuperAdmin())
            {
                var organization = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(cancellationToken: cancellationToken);
                if (!organization.IsRoot)
                {
                    _logger.LogDebug(
                        "Filtering users by OrganizationId: {OrganizationId}",
                        organization.OrganizationId);
                    query = query.HavingOrganization(organization);
                }
            }
        }

        var startTime = DateTime.UtcNow;
        var result = await Paging.CreateAsync(query, request, cancellationToken);
        var duration = DateTime.UtcNow - startTime;

        _logger.LogInformation(
            "User query executed. Results: {Count}, Duration: {Duration}ms",
            result.Data.Length,
            duration.TotalMilliseconds);

        return result;
    }
}
