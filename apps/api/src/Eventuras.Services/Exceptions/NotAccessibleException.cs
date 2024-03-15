using System;

namespace Eventuras.Services.Exceptions;

public class NotAccessibleException : ServiceException
{
    public NotAccessibleException() : this("Not accessible")
    {
    }

    public NotAccessibleException(string message) : base(message)
    {
    }

    public NotAccessibleException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
