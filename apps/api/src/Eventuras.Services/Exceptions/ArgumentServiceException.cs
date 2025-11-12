#nullable enable

using System;

namespace Eventuras.Services.Exceptions;

public class ArgumentServiceException : ServiceException
{
    public ArgumentServiceException(string message, string? paramName = null, Exception? innerException = null) :
        base(message, innerException) => ParamName = paramName;

    public string? ParamName { get; }
}
