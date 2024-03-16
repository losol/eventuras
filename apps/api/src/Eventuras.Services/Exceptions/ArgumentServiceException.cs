#nullable enable

using System;

namespace Eventuras.Services.Exceptions;

public class ArgumentServiceException : ServiceException
{
    public string? ParamName { get; }

    public ArgumentServiceException(string message, string? paramName = null, Exception? innerException = null) : base(message, innerException)
    {
        ParamName = paramName;
    }
}
