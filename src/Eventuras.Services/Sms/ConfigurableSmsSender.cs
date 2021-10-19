using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;
using Losol.Communication.Sms;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Sms
{
    /// <summary>
    /// Same as <see cref="Eventuras.Services.Email.ConfigurableEmailSender"/> but for SMS. 
    /// </summary>
    internal class ConfigurableSmsSender : ISmsSender
    {
        private readonly IConfigurableSmsSenderComponent[] _components;
        private readonly ILogger<ConfigurableSmsSender> _logger;

        public ConfigurableSmsSender(
            IEnumerable<IConfigurableSmsSenderComponent> components,
            ILogger<ConfigurableSmsSender> logger)
        {
            _components = components?.ToArray() ?? throw
                new ArgumentNullException(nameof(components));

            _logger = logger ?? throw
                new ArgumentNullException(nameof(logger));
        }

        public async Task<HealthCheckStatus> CheckHealthAsync(CancellationToken cancellationToken)
        {
            var sender = await GetSmsSenderAsync(cancellationToken);
            if (sender != null)
            {
                return await sender.CheckHealthAsync(cancellationToken);
            }

            return new HealthCheckStatus(HealthStatus.Unhealthy);
        }

        public async Task SendSmsAsync(string to, string body)
        {
            var sender = await GetSmsSenderAsync();
            if (sender != null)
            {
                await sender.SendSmsAsync(to, body);
            }
        }

        private async Task<ISmsSender> GetSmsSenderAsync(CancellationToken cancellationToken = default)
        {
            foreach (var component in _components)
            {
                var sender = await component.CreateSmsSenderAsync(cancellationToken);
                if (sender != null)
                {
                    return sender;
                }
            }

            throw new InvalidOperationException("No SMS sender is enabled in organization settings");
        }
    }
}
