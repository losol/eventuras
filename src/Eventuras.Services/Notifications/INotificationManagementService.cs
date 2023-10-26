using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Notifications
{
    public interface INotificationManagementService
    {
        Task<EmailNotification> CreateEmailNotificationAsync(
            string subject,
            string body,
            params string[] recipients);

        Task<EmailNotification> CreateEmailNotificationForEventAsync(
            string subject,
            string body,
            int eventId,
            int? productId = null,
            Registration.RegistrationStatus[] registrationStatuses = null,
            Registration.RegistrationType[] registrationTypes = null);

        Task<SmsNotification> CreateSmsNotificationAsync(
            string message,
            params string[] recipients);

        Task<SmsNotification> CreateSmsNotificationForEventAsync(
            string message,
            int eventId,
            int? productId = null,
            Registration.RegistrationStatus[] registrationStatuses = null,
            Registration.RegistrationType[] registrationTypes = null);

        Task UpdateNotificationAsync(Notification notification);

        Task UpdateNotificationRecipientAsync(NotificationRecipient recipient);
    }
}
