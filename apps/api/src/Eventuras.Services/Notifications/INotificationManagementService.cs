using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public interface INotificationManagementService
{
    Task<EmailNotification> CreateEmailNotificationAsync(
        string subject,
        string body,
        int orgId,
        params string[] recipients);

    Task<EmailNotification> CreateEmailNotificationForEventAsync(
        string subject,
        string body,
        int eventId,
        Registration.RegistrationStatus[] registrationStatuses = null,
        Registration.RegistrationType[] registrationTypes = null);

    Task<EmailNotification> CreateEmailNotificationForRegistrationAsync(
        string subject,
        string body,
        Registration registration);

    Task<SmsNotification> CreateSmsNotificationAsync(
        string message,
        params string[] recipients);

    Task<SmsNotification> CreateSmsNotificationForEventAsync(
        string message,
        int eventId,
        Registration.RegistrationStatus[] registrationStatuses = null,
        Registration.RegistrationType[] registrationTypes = null);

    Task UpdateNotificationAsync(Notification notification);

    Task UpdateNotificationRecipientAsync(NotificationRecipient recipient);
}
