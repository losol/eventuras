using System;

namespace Eventuras.Services.ExternalSync
{
    public class DuplicateExternalEventException : Exception
    {
        public DuplicateExternalEventException(string message) : base(message)
        {
        }

        public DuplicateExternalEventException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
