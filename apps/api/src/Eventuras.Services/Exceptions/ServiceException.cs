#nullable enable

using System;

namespace Eventuras.Services.Exceptions;

/// <summary>
///     aka BusinessLogicException
/// </summary>
public class ServiceException : ApplicationException
{
    public ServiceException(string? message = null, Exception? innerException = null) : base(message, innerException)
    {
    }
}
