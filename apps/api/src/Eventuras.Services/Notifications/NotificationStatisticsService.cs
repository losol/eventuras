using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Notifications;

internal class NotificationStatisticsService : INotificationStatisticsService
{
    private readonly ApplicationDbContext _context;

    public NotificationStatisticsService(ApplicationDbContext context) =>
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

    public async Task UpdateNotificationStatisticsAsync(Notification notification)
    {
        if (notification == null)
        {
            throw new ArgumentNullException(nameof(notification));
        }

        var stats = await _context.NotificationStatistics
            .SingleOrDefaultAsync(s => s.NotificationId == notification.NotificationId);

        if (stats == null)
        {
            stats = new NotificationStatistics(notification);
            await _context.AddAsync(stats);
        }

        stats.RecipientsTotal = await _context.NotificationRecipients
            .CountAsync(r => r.NotificationId == notification.NotificationId);

        stats.SentTotal = await _context.NotificationRecipients
            .CountAsync(r => r.NotificationId == notification.NotificationId && r.Sent.HasValue);

        stats.ErrorsTotal = await _context.NotificationRecipients
            .CountAsync(r => r.NotificationId == notification.NotificationId && r.Errors != null);

        await _context.SaveChangesAsync();
    }
}
