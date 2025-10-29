using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;

namespace Losol.Communication.Email;

public interface IEmailSender : IHealthCheckService
{
    const string ServiceName = "email";

    /// <exception cref="ValidationException">When given <code>emailModel</code> is not valid.</exception>
    /// <exception cref="EmailSenderException">Failed to send email</exception>
    Task SendEmailAsync(EmailModel emailModel, EmailOptions options = null);
}
