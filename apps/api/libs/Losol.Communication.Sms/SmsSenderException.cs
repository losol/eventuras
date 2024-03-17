using System;

namespace Losol.Communication.Sms;

public class SmsSenderException : Exception
{
    public SmsSenderException(string message) : base(message)
    {
    }

    public SmsSenderException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
