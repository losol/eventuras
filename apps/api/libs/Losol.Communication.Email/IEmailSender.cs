using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;

namespace Losol.Communication.Email;

public interface IEmailSender : IHealthCheckService
{
    const string ServiceName = "email";

    /// <summary>
    /// Sends email with optional attachment.
    /// </summary>
    /// <param name="address">Email address, may contain name in a standard form Some Name &lt;some@email.com&gt;</param>
    /// <param name="subject">Email subject</param>
    /// <param name="message">HTML or plain text to be sent</param>
    /// <param name="attachment">Optional email attachment</param>
    /// <param name="messageType">Type of the given <code>message</code> data. Can be <code>Text</code> or <code>Html</code></param>
    /// <exception cref="EmailSenderException">Failed to send email</exception>
    [Obsolete("Use SendEmailAsync(EmailModel) instead")]
    Task SendEmailAsync(
        string address,
        string subject,
        string message,
        Attachment attachment = null,
        EmailMessageType messageType = EmailMessageType.Html);

    /// <exception cref="ValidationException">When given <code>emailModel</code> is not valid.</exception>
    /// <exception cref="EmailSenderException">Failed to send email</exception>
    Task SendEmailAsync(EmailModel emailModel, EmailOptions options = null);
}
