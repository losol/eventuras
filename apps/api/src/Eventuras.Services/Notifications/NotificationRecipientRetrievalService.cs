using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Notifications;

internal class NotificationRecipientRetrievalService : INotificationRecipientRetrievalService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationRecipientAccessControlService _notificationRecipientAccessControlService;

    public NotificationRecipientRetrievalService(
        ApplicationDbContext context,
        INotificationRecipientAccessControlService notificationRecipientAccessControlService)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _notificationRecipientAccessControlService = notificationRecipientAccessControlService ?? throw
            new ArgumentNullException(nameof(notificationRecipientAccessControlService));
    }

    public async Task<NotificationRecipient> GetNotificationRecipientByIdAsync(
        int recipientId,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default)
    {
        if (!accessControlDone)
        {
            throw new NotImplementedException("Access control must be done before calling this method");
        }

        var query = _context.NotificationRecipients
            .Where(r => r.RecipientId == recipientId);

        return await query.FirstOrDefaultAsync();
    }

    public async Task<Paging<NotificationRecipient>> ListNotificationRecipientsAsync(
        NotificationRecipientListRequest request,
        NotificationRecipientRetrievalOptions options = default,
        CancellationToken cancellationToken = default)
    {
        var query = _context.NotificationRecipients
            .WithOptions(options)
            .AddFilter(request.Filter)
            .AddOrder(request.OrderBy, request.Descending);

        if (request.Filter.AccessibleOnly)
        {
            query = await _notificationRecipientAccessControlService
                .AddAccessFilterAsync(query, cancellationToken);
        }

        return await Paging.CreateAsync(query, request, cancellationToken);
    }
}
