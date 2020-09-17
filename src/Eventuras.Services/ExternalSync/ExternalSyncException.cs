using System;

namespace Eventuras.Services.ExternalSync
{
    public class ExternalSyncException : Exception
    {
        public ExternalSyncException()
        {
        }

        public ExternalSyncException(string message) : base(message)
        {
        }
    }
}
