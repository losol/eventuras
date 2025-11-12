#nullable enable
using System;

namespace Eventuras.Services.Exceptions;

public class InvalidOperationServiceException : ServiceException
{
    public InvalidOperationServiceException(string message, string? paramName = null, Exception? innerException = null)
        : base(message, innerException)
    {
    }
}
