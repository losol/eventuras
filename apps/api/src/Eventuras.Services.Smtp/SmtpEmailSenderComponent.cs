using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Email;
using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Email;
using Losol.Communication.Email.Smtp;
using Losol.Communication.HealthCheck.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.Smtp;

internal class SmtpEmailSenderComponent : IConfigurableEmailSenderComponent
{
    private readonly IHealthCheckStorage _healthCheckStorage;
    private readonly ILoggerFactory _loggerFactory;
    private readonly IOrganizationSettingsAccessorService _organizationSettingsAccessorService;

    public SmtpEmailSenderComponent(
        IOrganizationSettingsAccessorService organizationSettingsAccessorService,
        IHealthCheckStorage healthCheckStorage,
        ILoggerFactory loggerFactory)
    {
        _organizationSettingsAccessorService = organizationSettingsAccessorService ?? throw
            new ArgumentNullException(nameof(organizationSettingsAccessorService));

        _healthCheckStorage = healthCheckStorage ?? throw
            new ArgumentNullException(nameof(healthCheckStorage));

        _loggerFactory = loggerFactory ?? throw
            new ArgumentNullException(nameof(loggerFactory));
    }

    public async Task<IEmailSender> CreateEmailSenderAsync(int? organizationId = null,
        CancellationToken cancellationToken = default)
    {
        var settings = await _organizationSettingsAccessorService
            .ReadOrganizationSettingsAsync<OrganizationSmtpSettings>(organizationId);

        if (!settings.Enabled)
        {
            return null;
        }

        var logger = _loggerFactory.CreateLogger<SmtpEmailSender>();

        return new SmtpEmailSender(
            Options.Create(settings.ToSmtpConfig()),
            _healthCheckStorage, logger);
    }
}
