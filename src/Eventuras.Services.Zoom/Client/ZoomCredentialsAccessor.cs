using Microsoft.Extensions.Options;
using System;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace Eventuras.Services.Zoom.Client
{
    internal class ZoomCredentialsAccessor : IZoomCredentialsAccessor
    {
        private readonly IOptions<ZoomSettings> _options;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ZoomCredentialsAccessor(
            IOptions<ZoomSettings> options,
            IHttpContextAccessor httpContextAccessor)
        {
            _options = options ?? throw new ArgumentNullException(nameof(options));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public ZoomJwtCredentials GetJwtCredentials()
        {
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
