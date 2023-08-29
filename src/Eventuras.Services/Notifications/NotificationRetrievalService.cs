using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Notifications
{
    internal class NotificationRetrievalService : INotificationRetrievalService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationAccessControlService _notificationAccessControlService;

        public NotificationRetrievalService(
            ApplicationDbContext context,
            INotificationAccessControlService notificationAccessControlService)
        {
            _context = context ?? throw
                new ArgumentNullException(nameof(context));

            _notificationAccessControlService = notificationAccessControlService ?? throw
                new ArgumentNullException(nameof(notificationAccessControlService));
        }

        public async Task<Notification> GetNotificationByIdAsync(int id,
            NotificationRetrievalOptions options = default,
            CancellationToken cancellationToken = default)
        {
            var notification = await _context.Notifications
                                   .WithOptions(options ?? new NotificationRetrievalOptions())
                                   .Where(n => n.NotificationId == id)
                                   .FirstOrDefaultAsync(cancellationToken) ??
                               throw new NotFoundException($"Notification {id} not found");

            if (options?.ForUpdate == true)
            {
                await _notificationAccessControlService
                    .CheckNotificationUpdateAccessAsync(notification, cancellationToken);
            }
            else
            {
                await _notificationAccessControlService
                    .CheckNotificationReadAccessAsync(notification, cancellationToken);
            }

            return notification;
        }

        public async Task<Paging<Notification>> ListNotificationsAsync(
            NotificationListRequest request,
            NotificationRetrievalOptions options = default,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Notifications
                .WithOptions(options ?? new NotificationRetrievalOptions())
                .AddFilter(request.Filter)
                .AddOrder(request.OrderBy, request.Descending);

            if (request.Filter.AccessibleOnly)
            {
                query = await _notificationAccessControlService
                    .AddAccessFilterAsync(query, cancellationToken);
            }

            return await Paging.CreateAsync(query, request, cancellationToken);
        }
    }
}
