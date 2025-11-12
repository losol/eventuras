using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;

namespace Eventuras.Services.Notifications;

internal class NotificationRecipientAccessControlService : INotificationRecipientAccessControlService
{
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public NotificationRecipientAccessControlService(
        IHttpContextAccessor httpContextAccessor,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService)
    {
        _httpContextAccessor = httpContextAccessor ?? throw
            new ArgumentNullException(nameof(httpContextAccessor));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));
    }

    public async Task<IQueryable<NotificationRecipient>> AddAccessFilterAsync(
        IQueryable<NotificationRecipient> query,
        CancellationToken cancellationToken = default)
    {
        var user = _httpContextAccessor.HttpContext.User;

        if (user.IsAnonymous())
        {
            throw new NotAccessibleException("Anonymous users are not permitted to access any " +
                                             "notification recipient info.");
        }

        if (user.IsPowerAdmin())
        {
            return query; // power admin can see all notifications
        }

        var userId = user.GetUserId();
        if (!user.IsAdmin())
        {
            // non-admins can only read their own recipient info
            return query.Where(r => r.RecipientUserId == userId);
        }

        var org = await _currentOrganizationAccessorService
            .RequireCurrentOrganizationAsync(cancellationToken: cancellationToken);

        var orgId = org.OrganizationId;
        return query.Where(r => r.Notification.OrganizationId == orgId &&
                                r.Notification.Organization.Members.Any(m => m.UserId == userId));
    }
}
