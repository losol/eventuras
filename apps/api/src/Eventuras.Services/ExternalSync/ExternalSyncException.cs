using System;

namespace Eventuras.Services.ExternalSync;

public class ExternalSyncException : Exception
{
    public ExternalSyncException()
    {
    }

    public ExternalSyncException(string message) : base(message)
    {
    }

    public ExternalSyncException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
