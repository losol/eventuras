using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services.Organizations.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.Zoom.Client
{
    internal class ZoomCredentialsAccessor : IZoomCredentialsAccessor
    {
        private const string ZoomApiKeySettingKey = "ZOOM_API_KEY";
        private const string ZoomApiKeySettingDescription = "Zoom API key";
        private const string ZoomApiSecretSettingKey = "ZOOM_API_SECRET";
        private const string ZoomApiSecretSettingDescription = "Zoom API secret";
        private const string ZoomSectionName = "Zoom";

        private readonly IOptions<ZoomSettings> _options;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IOrganizationSettingsAccessorService _organizationSettingsAccessorService;
        private readonly ILogger<ZoomCredentialsAccessor> _logger;

        public ZoomCredentialsAccessor(
            IOptions<ZoomSettings> options,
            IHttpContextAccessor httpContextAccessor,
            IOrganizationSettingsAccessorService organizationSettingsAccessorService,
            IOrganizationSettingsRegistry organizationSettingsRegistry,
            ILogger<ZoomCredentialsAccessor> logger)
        {
            _options = options ?? throw new ArgumentNullException(nameof(options));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _organizationSettingsAccessorService = organizationSettingsAccessorService ?? throw
                new ArgumentNullException(nameof(organizationSettingsAccessorService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            organizationSettingsRegistry
                .RegisterSettingAsync(ZoomApiKeySettingKey,
                    ZoomSectionName,
                    ZoomApiKeySettingDescription,
                    OrganizationSettingType.String);

            organizationSettingsRegistry
                .RegisterSettingAsync(ZoomApiSecretSettingKey,
                    ZoomSectionName,
                    ZoomApiSecretSettingDescription,
                    OrganizationSettingType.String);
        }

        public async Task<ZoomJwtCredentials> GetJwtCredentialsAsync()
        {
            var apiKey =
                await _organizationSettingsAccessorService
                    .GetOrganizationSettingByNameAsync(
                        ZoomApiKeySettingKey);

            var apiSecret =
                await _organizationSettingsAccessorService
                    .GetOrganizationSettingByNameAsync(
                        ZoomApiSecretSettingKey);

            if (!string.IsNullOrEmpty(apiKey) &&
                !string.IsNullOrEmpty(apiSecret))
            {
                _logger.LogDebug("Using Zoom JWT credentials from organization settings");
                return new ZoomJwtCredentials
                {
                    Name = "Zoom",
                    ApiKey = apiKey,
                    ApiSecret = apiSecret
                };
            }

            _logger.LogDebug("Getting Zoom JWT credentials from host-based configuration");
            var host = _httpContextAccessor.HttpContext.Request.Host;
            if (!host.HasValue)
            {
                throw new InvalidOperationException("Cannot determine host for request");
            }

            return _options.Value.Apps?.FirstOrDefault(a => a.Name == host.Value)
                   ?? _options.Value.Apps?.FirstOrDefault(a => a.Name == "*")
                   ?? throw new ZoomConfigurationException($"Zoom config not found for host {host.Value}");
        }
    }
}
