using System;

namespace Losol.Communication.HealthCheck.Abstractions;

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

    protected bool Equals(HealthCheckStatus other)
    {
        return Status == other.Status && DateTime.Equals(other.DateTime) && ErrorMessage == other.ErrorMessage;
    }

    public override bool Equals(object obj)
    {
        if (ReferenceEquals(null, obj))
            return false;
        if (ReferenceEquals(this, obj))
            return true;
        if (obj.GetType() != this.GetType())
            return false;
        return Equals((HealthCheckStatus)obj);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine((int)Status, DateTime, ErrorMessage);
    }
}
