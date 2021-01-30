using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Notifications
{
    public interface IEmailNotificationService
    {
        Task SendEmailToRecipientsAsync(
            EmailNotification notification,
            string[] recipientAddresses,
            CancellationToken cancellationToken = default);
    }

    public class EmailNotification
    {
        [Required]
        public string Subject { get; set; }

        [Required]
        public string BodyMarkdown { get; set; }

        // TODO: add attachment?
        // TODO: add CC?
        // TODO: add BCC?
    }
}
