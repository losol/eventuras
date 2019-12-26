using System;

namespace EventManagement.Services.Converto
{
    public class ConvertoClientException : Exception
    {
        public ConvertoClientException(string message) : base(message)
        {
        }

        public ConvertoClientException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
