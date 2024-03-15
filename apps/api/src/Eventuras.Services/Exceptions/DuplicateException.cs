using System;

namespace Eventuras.Services.Exceptions;

public class DuplicateException : ServiceException
{
    public DuplicateException()
    {
    }

    public DuplicateException(string message) : base(message)
    {
    }

    public DuplicateException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
