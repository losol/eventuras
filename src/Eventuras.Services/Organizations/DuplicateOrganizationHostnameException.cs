using System;

namespace Eventuras.Services.Organizations
{
    public class DuplicateOrganizationHostnameException : Exception
    {
        public DuplicateOrganizationHostnameException() : base("Duplicate org hostname")
        {
        }

        public DuplicateOrganizationHostnameException(string hostname) : base($"Duplicate org hostname: {hostname}")
        {
        }
    }
}
