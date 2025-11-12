using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Losol.Communication.Email.Smtp;

public class SmtpEmailSender : AbstractEmailSender
{
    private readonly ILogger<SmtpEmailSender> _logger;
    private readonly SmtpConfig _smtpConfig;

    public SmtpEmailSender(
        IOptions<SmtpConfig> smtpConfig,
        IHealthCheckStorage healthCheckStorage,
        ILogger<SmtpEmailSender> logger) : base(healthCheckStorage)
    {
        _smtpConfig = smtpConfig.Value ?? throw new ArgumentNullException(nameof(smtpConfig));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override async Task SendEmailInternalAsync(EmailModel emailModel)
    {
        var mimeMessage = new MimeMessage { Subject = emailModel.Subject };

        mimeMessage.From.Add(emailModel.From != null
            ? new MailboxAddress(Encoding.UTF8, emailModel.From.Name, emailModel.From.Email)
            : new MailboxAddress(Encoding.UTF8, _smtpConfig.FromName, _smtpConfig.FromEmail));

        mimeMessage.To.AddRange(emailModel.Recipients.Select(a => new MailboxAddress(Encoding.UTF8, a.Name, a.Email)));

        if (emailModel.Cc?.Any() == true)
        {
            mimeMessage.Cc.AddRange(emailModel.Cc.Select(a => new MailboxAddress(Encoding.UTF8, a.Name, a.Email)));
        }

        if (emailModel.Bcc?.Any() == true)
        {
            mimeMessage.Bcc.AddRange(emailModel.Bcc.Select(a => new MailboxAddress(Encoding.UTF8, a.Name, a.Email)));
        }

        var bodyBuilder = new BodyBuilder { TextBody = emailModel.TextBody, HtmlBody = emailModel.HtmlBody };

        if (emailModel.Attachments != null)
        {
            foreach (var attachment in emailModel.Attachments)
            {
                var mimeEntity = bodyBuilder.Attachments.Add(
                    attachment.Filename,
                    attachment.Bytes,
                    ContentType.Parse(attachment.ContentType));

                if (!string.IsNullOrEmpty(attachment.ContentDisposition))
                {
                    mimeEntity.ContentDisposition = ContentDisposition.Parse(attachment.ContentDisposition);
                }

                if (!string.IsNullOrEmpty(attachment.ContentId))
                {
                    mimeEntity.ContentId = attachment.ContentId;
                }
            }
        }

        mimeMessage.Body = bodyBuilder.ToMessageBody();

        using var emailClient = new SmtpClient();

        try
        {
            _logger.LogInformation(
                $"*** START SEND EMAIL BY SMTP - Smtp host: {_smtpConfig.Host} - Port: {_smtpConfig.Port}***");

            await emailClient.ConnectAsync(_smtpConfig.Host, _smtpConfig.Port, SecureSocketOptions.StartTls);
            if (!string.IsNullOrEmpty(_smtpConfig.Username) &&
                !string.IsNullOrEmpty(_smtpConfig.Password))
            {
                await emailClient.AuthenticateAsync(_smtpConfig.Username, _smtpConfig.Password);
            }

            await emailClient.SendAsync(mimeMessage);
            await emailClient.DisconnectAsync(true);

            _logger.LogInformation("*** END SEND EMAIL ***");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occured while sending email: {ExceptionMessage}", ex.Message);
            throw new EmailSenderException(ex.Message, ex);
        }
    }

    public override async Task<HealthCheckStatus> CheckHealthAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Performing health check");

        try
        {
            using var emailClient = new SmtpClient();

            _logger.LogDebug("Connecting to {host}:{port}", _smtpConfig.Host, _smtpConfig.Port);
            await emailClient.ConnectAsync(_smtpConfig.Host, _smtpConfig.Port, SecureSocketOptions.StartTls,
                cancellationToken);
            _logger.LogDebug("Connection successful");

            if (!string.IsNullOrEmpty(_smtpConfig.Username) &&
                !string.IsNullOrEmpty(_smtpConfig.Password))
            {
                _logger.LogDebug("Performing authentication");
                await emailClient.AuthenticateAsync(_smtpConfig.Username, _smtpConfig.Password, cancellationToken);
                _logger.LogDebug("Auth successful");
            }

            _logger.LogDebug("Disconnecting from server");
            await emailClient.DisconnectAsync(true, cancellationToken);
            _logger.LogDebug("Disconnected from server");

            _logger.LogInformation("Health check passed");
            return new HealthCheckStatus(HealthStatus.Healthy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health status check failed: {ExceptionMessage}", ex.Message);
            return new HealthCheckStatus(HealthStatus.Unhealthy, ex.Message);
        }
    }
}
