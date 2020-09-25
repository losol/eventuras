using System;

namespace Eventuras.Services.Organizations
{
    public class DuplicateOrganizationHostnameException : Exception
    {
        public DuplicateOrganizationHostnameException(string message) : base(message)
        {
        }

        public DuplicateOrganizationHostnameException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
