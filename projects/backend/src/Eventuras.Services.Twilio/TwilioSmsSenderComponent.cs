using Eventuras.Services.Organizations.Settings;
using Eventuras.Services.Sms;
using Losol.Communication.HealthCheck.Abstractions;
using Losol.Communication.Sms;
using Losol.Communication.Sms.Twilio;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Twilio
{
    internal class TwilioSmsSenderComponent : IConfigurableSmsSenderComponent
    {
        private readonly IOrganizationSettingsAccessorService _organizationSettingsAccessorService;
        private readonly IHealthCheckStorage _healthCheckStorage;
        private readonly ILoggerFactory _loggerFactory;

        public TwilioSmsSenderComponent(
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

        public async Task<ISmsSender> CreateSmsSenderAsync(CancellationToken cancellationToken = default)
        {
            var settings = await _organizationSettingsAccessorService
                .ReadOrganizationSettingsAsync<OrganizationTwilioSettings>();

            if (!settings.Enabled)
            {
                return null;
            }

            var logger = _loggerFactory.CreateLogger<TwilioSmsSender>();

            return new TwilioSmsSender(
                Options.Create(settings.ToTwilioOptions()),
                _healthCheckStorage, logger);
        }
    }
}
