using Eventuras.Services.Email;
using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Email;
using Losol.Communication.Email.SendGrid;
using Losol.Communication.HealthCheck.Abstractions;
using Microsoft.Extensions.Options;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.SendGrid
{
    internal class SendGridEmailSenderComponent : IConfigurableEmailSenderComponent
    {
        private readonly IOrganizationSettingsAccessorService _organizationSettingsAccessorService;
        private readonly IHealthCheckStorage _healthCheckStorage;

        public SendGridEmailSenderComponent(
            IOrganizationSettingsAccessorService organizationSettingsAccessorService,
            IHealthCheckStorage healthCheckStorage)
        {
            _organizationSettingsAccessorService = organizationSettingsAccessorService ?? throw
                new ArgumentNullException(nameof(organizationSettingsAccessorService));

            _healthCheckStorage = healthCheckStorage ?? throw
                new ArgumentNullException(nameof(healthCheckStorage));
        }

        public async Task<IEmailSender> CreateEmailSenderAsync(CancellationToken cancellationToken = default)
        {
            var settings = await _organizationSettingsAccessorService
                .ReadOrganizationSettingsAsync<OrganizationSendGridSettings>();

            if (!settings.Enabled)
            {
                return null;
            }

            return new SendGridEmailSender(
                Options.Create(settings.ToSendGridConfig()),
                _healthCheckStorage);
        }
    }
}
