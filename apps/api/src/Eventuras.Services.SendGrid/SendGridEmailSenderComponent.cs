using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Email;
using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Email;
using Losol.Communication.Email.SendGrid;
using Losol.Communication.HealthCheck.Abstractions;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.SendGrid;

internal class SendGridEmailSenderComponent : IConfigurableEmailSenderComponent
{
    private readonly IHealthCheckStorage _healthCheckStorage;
    private readonly IOrganizationSettingsAccessorService _organizationSettingsAccessorService;

    public SendGridEmailSenderComponent(
        IOrganizationSettingsAccessorService organizationSettingsAccessorService,
        IHealthCheckStorage healthCheckStorage)
    {
        _organizationSettingsAccessorService = organizationSettingsAccessorService ?? throw
            new ArgumentNullException(nameof(organizationSettingsAccessorService));

        _healthCheckStorage = healthCheckStorage ?? throw
            new ArgumentNullException(nameof(healthCheckStorage));
    }

    public async Task<IEmailSender> CreateEmailSenderAsync(int? organizationId = null,
        CancellationToken cancellationToken = default)
    {
        var settings = await _organizationSettingsAccessorService
            .ReadOrganizationSettingsAsync<OrganizationSendGridSettings>(organizationId);

        if (!settings.Enabled)
        {
            return null;
        }

        return new SendGridEmailSender(
            Options.Create(settings.ToSendGridConfig()),
            _healthCheckStorage);
    }
}
