using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Notifications;

internal class NotificationAccessControlService(
    IHttpContextAccessor httpContextAccessor,
    ICurrentOrganizationAccessorService currentOrganizationAccessorService,
    ApplicationDbContext context)
    : INotificationAccessControlService
{
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor ?? throw
        new ArgumentNullException(nameof(httpContextAccessor));

    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService =
        currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));

    private readonly ApplicationDbContext _context = context ?? throw
        new ArgumentNullException(nameof(context));

    public async Task CheckNotificationReadAccessAsync(Notification notification,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(notification);
        CheckAuthenticatedUser();

        await PerformAccessCheckAsync(notification, cancellationToken);
    }

    public async Task CheckNotificationsReadAccessAsync(List<Notification> notifications,
        CancellationToken cancellationToken = default)
    {
        await ValidateAccess(notifications, cancellationToken, "read");
    }

    public async Task CheckNotificationUpdateAccessAsync(Notification notification,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(notification);

        var user = GetContextUser();
        if (!user.IsAdmin())
        {
            throw new NotAccessibleException("Notifications can only be updated by admin");
        }

        await PerformAccessCheckAsync(notification, cancellationToken);
    }

    public async Task CheckNotificationsUpdateAccessAsync(List<Notification> notifications,
        CancellationToken cancellationToken = default)
    {
        var user = GetContextUser();
        if (!user.IsAdmin())
        {
            throw new NotAccessibleException("Notifications can only be updated by admin");
        }

        await ValidateAccess(notifications, cancellationToken, "update");
    }

    private async Task PerformAccessCheckAsync(Notification notification, CancellationToken cancellationToken)
    {
        var query = await AddAccessFilterAsync(_context
                .Notifications
                .AsNoTracking(),
            cancellationToken);

        if (!await query.AnyAsync(cancellationToken))
        {
            throw new NotAccessibleException($"Notification {notification.NotificationId} is not accessible");
        }
    }

    public async Task<IQueryable<Notification>> AddAccessFilterAsync(IQueryable<Notification> query,
        CancellationToken cancellationToken = default)
    {
        var user = GetContextUser();

        if (user.IsPowerAdmin())
        {
            return query; // power admin can see all notifications
        }

        var userId = user.GetUserId();
        if (!user.IsAdmin())
        {
            // non-admins can only read their own notifications
            return query.Where(n => n.Recipients
                .Any(r => r.RecipientUserId == userId));
        }

        var org = await _currentOrganizationAccessorService
            .RequireCurrentOrganizationAsync(cancellationToken: cancellationToken);

        return query.Where(r => (r.OrganizationId == org.OrganizationId &&
                                 r.Organization.Members.Any(m => m.UserId == userId)) ||
                                (r.EventInfo.OrganizationId == org.OrganizationId &&
                                 r.EventInfo.Organization.Members.Any(m => m.UserId == userId)));
    }


    private void CheckHttpContext() => ArgumentNullException.ThrowIfNull(_httpContextAccessor.HttpContext);

    private void CheckAuthenticatedUser()
    {
        CheckHttpContext();

        var user = _httpContextAccessor.HttpContext?.User;

        if (user == null)
        {
            throw new NotAccessibleException("Anonymous users are not permitted to access any notifications.");
        }

        if (user.Identity == null)
        {
            throw new NotAccessibleException("Anonymous users are not permitted to access any notifications.");
        }

        if (!user.Identity.IsAuthenticated)
        {
            throw new NotAccessibleException("Anonymous users are not permitted to access any notifications.");
        }
    }

    private ClaimsPrincipal GetContextUser()
    {
        CheckAuthenticatedUser();
        return _httpContextAccessor.HttpContext!.User;
    }

    private async Task ValidateAccess(List<Notification> notifications,
        CancellationToken cancellationToken,
        string accessType)
    {
        if (notifications is null || notifications.Count == 0)
        {
            throw new InvalidOperationException("Notifications list cannot be null or empty");
        }

        CheckAuthenticatedUser();

        var notificationIds = notifications.Select(n => n.NotificationId).ToList();
        var query = await AddAccessFilterAsync(_context.Notifications.AsNoTracking(), cancellationToken);

        var accessibleCount = await query
            .Where(n => notificationIds.Contains(n.NotificationId))
            .CountAsync(cancellationToken);

        if (accessibleCount != notificationIds.Count)
        {
            throw new NotAccessibleException(
                $"Some notifications are not accessible for {accessType}. Total: {notificationIds.Count}, Accessible: {accessibleCount}");
        }
    }
}
