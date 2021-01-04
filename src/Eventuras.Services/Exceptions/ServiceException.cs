using System;

namespace Eventuras.Services.Exceptions
{
    /// <summary>
    /// aka BusinessLogicException
    /// </summary>
    public class ServiceException : Exception
    {
        public ServiceException()
        {
        }

        public ServiceException(string message) : base(message)
        {
        }

        public ServiceException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
