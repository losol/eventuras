using System;

namespace Losol.Communication.HealthCheck.Abstractions
{
    public class HealthCheckStatus
    {
        public HealthStatus Status { get; }

        public DateTime DateTime { get; set; } = DateTime.UtcNow;

        public string ErrorMessage { get; }

        public HealthCheckStatus(HealthStatus status, string errorMessage = null)
        {
            Status = status;
            ErrorMessage = errorMessage;
        }
    }
}
