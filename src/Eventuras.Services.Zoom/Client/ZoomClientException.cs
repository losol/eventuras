using System;

namespace Eventuras.Services.Zoom.Client
{
    internal class ZoomClientException : Exception
    {
        public ZoomClientException(string message) : base(message)
        {
        }

        public ZoomClientException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
