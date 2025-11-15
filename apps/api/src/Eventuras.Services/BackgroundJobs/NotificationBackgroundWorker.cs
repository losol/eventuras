using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;
using Losol.Communication.Email;
using Losol.Communication.Sms;
using Markdig;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NodaTime;

namespace Eventuras.Services.BackgroundJobs;

/// <summary>
/// Background service that processes notification delivery jobs from the queue.
/// </summary>
public sealed class NotificationBackgroundWorker : BackgroundService
{
    private readonly IBackgroundJobQueue _jobQueue;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<NotificationBackgroundWorker> _logger;
    private readonly TimeSpan _delayBetweenEmails = TimeSpan.FromMilliseconds(500); // 2 emails per second

    public NotificationBackgroundWorker(
        IBackgroundJobQueue jobQueue,
        IServiceScopeFactory serviceScopeFactory,
        ILogger<NotificationBackgroundWorker> logger)
    {
        _jobQueue = jobQueue ?? throw new ArgumentNullException(nameof(jobQueue));
        _serviceScopeFactory = serviceScopeFactory ?? throw new ArgumentNullException(nameof(serviceScopeFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification Background Worker is starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var (recipientId, accessControlDone) = await _jobQueue.DequeueNotificationJobAsync(stoppingToken);

                _logger.LogInformation("Processing notification for recipient {RecipientId}", recipientId);

                // Create a new scope for each job to get scoped services
                await using var scope = _serviceScopeFactory.CreateAsyncScope();

                await ProcessNotificationAsync(
                    recipientId,
                    accessControlDone,
                    scope.ServiceProvider,
                    stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing notification job");
                // Continue processing other jobs even if one fails
            }
        }

        _logger.LogInformation("Notification Background Worker is stopping");
    }

    private async Task ProcessNotificationAsync(
        int recipientId,
        bool accessControlDone,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var emailSender = serviceProvider.GetRequiredService<IEmailSender>();
        var smsSender = serviceProvider.GetRequiredService<ISmsSender>();
        var notificationManagementService = serviceProvider.GetRequiredService<Notifications.INotificationManagementService>();
        var notificationRetrievalService = serviceProvider.GetRequiredService<Notifications.INotificationRetrievalService>();
        var notificationRecipientRetrievalService = serviceProvider.GetRequiredService<Notifications.INotificationRecipientRetrievalService>();

        var recipient = await notificationRecipientRetrievalService
            .GetNotificationRecipientByIdAsync(recipientId, true);

        if (recipient == null)
        {
            _logger.LogWarning("Recipient {RecipientId} not found", recipientId);
            return;
        }

        var notification = await notificationRetrievalService
            .GetNotificationByIdAsync(recipient.NotificationId, accessControlDone: accessControlDone);

        if (notification.OrganizationId == null)
        {
            throw new NotFoundException(nameof(notification.OrganizationId));
        }

        var message = notification.Type == NotificationType.Email
            ? Markdown.ToHtml(notification.Message)
            : notification.Message;

        try
        {
            if (notification is EmailNotification email)
            {
                await emailSender.SendEmailAsync(new EmailModel
                {
                    Recipients = new[]
                    {
                        new Address(recipient.RecipientName, recipient.RecipientIdentifier)
                    },
                    Subject = email.Subject,
                    HtmlBody = message
                }, new EmailOptions { OrganizationId = email.OrganizationId });

                recipient.Sent = SystemClock.Instance.GetCurrentInstant();
                await notificationManagementService.UpdateNotificationRecipientAsync(recipient);

                // Rate limit email sending to avoid hitting provider limits (e.g., Gmail)
                await Task.Delay(_delayBetweenEmails, cancellationToken);
            }
            else if (notification.Type == NotificationType.Sms)
            {
                // SMS doesn't need rate limiting - provider handles this
                await smsSender.SendSmsAsync(
                    recipient.RecipientIdentifier,
                    message,
                    notification.OrganizationId.Value);

                recipient.Sent = SystemClock.Instance.GetCurrentInstant();
                await notificationManagementService.UpdateNotificationRecipientAsync(recipient);
            }

            _logger.LogInformation("Successfully sent notification to recipient {RecipientId}", recipientId);
        }
        catch (OperationCanceledException)
        {
            // Cancellation during shutdown - don't mark as failed
            _logger.LogInformation("Notification sending cancelled for recipient {RecipientId}", recipientId);
            throw;
        }
        catch (Exception e)
        {
            // Save the error to the notification recipient
            recipient.Errors = e.Message;
            await notificationManagementService.UpdateNotificationRecipientAsync(recipient);

            _logger.LogError(e, "Error sending notification to recipient {RecipientId}: {ExceptionMessage}",
                recipientId, e.Message);
            throw;
        }
    }
}
