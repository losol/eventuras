using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Organizations.Settings;
using Eventuras.Services.Sms;
using Losol.Communication.Sms;
using Losol.Communication.Sms.Twilio;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.Twilio;

internal class TwilioSmsSenderComponent : IConfigurableSmsSenderComponent
{
    private readonly ILoggerFactory _loggerFactory;
    private readonly IOrganizationSettingsAccessorService _organizationSettingsAccessorService;

    public TwilioSmsSenderComponent(
        IOrganizationSettingsAccessorService organizationSettingsAccessorService,
        ILoggerFactory loggerFactory)
    {
        _organizationSettingsAccessorService = organizationSettingsAccessorService ?? throw
            new ArgumentNullException(nameof(organizationSettingsAccessorService));

        _loggerFactory = loggerFactory ?? throw
            new ArgumentNullException(nameof(loggerFactory));
    }

    public async Task<ISmsSender> CreateSmsSenderAsync(int orgId, CancellationToken cancellationToken = default)
    {
        var settings = await _organizationSettingsAccessorService
            .ReadOrganizationSettingsAsync<OrganizationTwilioSettings>(orgId);

        if (!settings.Enabled)
        {
            return null;
        }

        var logger = _loggerFactory.CreateLogger<TwilioSmsSender>();

        return new TwilioSmsSender(
            Options.Create(settings.ToTwilioOptions()), logger);
    }
}
