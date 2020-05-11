using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Losol.Communication.Email
{
    public interface IEmailSender
    {
        /// <summary>
        /// Sends email with optional attachment.
        /// </summary>
        /// <param name="address">Email address, may contain name in a standard form Some Name &lt;some@email.com&gt;</param>
        /// <param name="subject">Email subject</param>
        /// <param name="message">HTML or plain text to be sent</param>
        /// <param name="attachment">Optional email attachment</param>
        /// <param name="messageType">Type of the given <code>message</code> data. Can be <code>Text</code> or <code>Html</code></param>
        [Obsolete("Use SendEmailAsync(EmailModel) instead")]
        Task SendEmailAsync(
            string address,
            string subject,
            string message,
            Attachment attachment = null,
            EmailMessageType messageType = EmailMessageType.Html);

        /// <exception cref="ValidationException">When given <code>emailModel</code> is not valid.</exception>
        Task SendEmailAsync(EmailModel emailModel);
    }
}
