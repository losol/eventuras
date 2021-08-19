using System;

namespace Eventuras.Services.Invoicing
{
    public class InvoicingException : Exception
    {
        public InvoicingException(string message) : base(message)
        {
        }

        public InvoicingException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
