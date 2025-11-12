using System;

namespace Losol.Communication.HealthCheck.Abstractions;

public class HealthCheckStatus
{
    public HealthCheckStatus(HealthStatus status, string errorMessage = null)
    {
        Status = status;
        ErrorMessage = errorMessage;
    }

    public HealthStatus Status { get; }

    public DateTime DateTime { get; set; } = DateTime.UtcNow;

    public string ErrorMessage { get; }

    protected bool Equals(HealthCheckStatus other) => Status == other.Status && DateTime.Equals(other.DateTime) &&
                                                      ErrorMessage == other.ErrorMessage;

    public override bool Equals(object obj)
    {
        if (ReferenceEquals(null, obj))
        {
            return false;
        }

        if (ReferenceEquals(this, obj))
        {
            return true;
        }

        if (obj.GetType() != GetType())
        {
            return false;
        }

        return Equals((HealthCheckStatus)obj);
    }

    public override int GetHashCode() => HashCode.Combine((int)Status, DateTime, ErrorMessage);
}
