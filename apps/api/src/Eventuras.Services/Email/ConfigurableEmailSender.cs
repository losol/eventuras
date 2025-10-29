using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.Email;
using Losol.Communication.HealthCheck.Abstractions;

namespace Eventuras.Services.Email;

/// <summary>
/// Selects the underlying email sender from the list,
/// based on the current configuration. (Takes the first
/// enabled sender from the list). The list itself can be
/// configured so it contains multiple senders like SMTP
/// sender, SendGrid and so on. Each of then can be disabled
/// in settings, like, in org settings. This sender performs
/// lookup on each send, so it can be used for per-org
/// configuration check.
/// </summary>
internal class ConfigurableEmailSender : IEmailSender
{
    private readonly IConfigurableEmailSenderComponent[] _components;

    public ConfigurableEmailSender(IEnumerable<IConfigurableEmailSenderComponent> components) =>
        _components = components?.ToArray() ?? throw
            new ArgumentNullException(nameof(components));

    public async Task<HealthCheckStatus> CheckHealthAsync(CancellationToken cancellationToken)
    {
        var sender = await GetEmailSenderAsync(cancellationToken: cancellationToken);
        if (sender != null)
        {
            return await sender.CheckHealthAsync(cancellationToken);
        }

        return new HealthCheckStatus(HealthStatus.Unhealthy);
    }

    public async Task SendEmailAsync(EmailModel emailModel, EmailOptions options = null)
    {
        var sender = await GetEmailSenderAsync(options?.OrganizationId);
        if (sender != null)
        {
            await sender.SendEmailAsync(emailModel);
        }
        else
        {
            throw new InvalidOperationException("No email sender is enabled in organization settings");
        }
    }

    private async Task<IEmailSender> GetEmailSenderAsync(int? organizationId = null,
        CancellationToken cancellationToken = default)
    {
        foreach (var component in _components)
        {
            var sender = await component.CreateEmailSenderAsync(organizationId, cancellationToken);
            if (sender != null)
            {
                return sender;
            }
        }

        throw new InvalidOperationException("No email sender is enabled in organization settings");
    }
}
