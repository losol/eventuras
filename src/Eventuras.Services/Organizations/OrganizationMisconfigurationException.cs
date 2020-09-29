using System;

namespace Eventuras.Services.Organizations
{
    /// <summary>
    /// Organization is not configured for the current hostname.
    /// </summary>
    public class OrganizationMisconfigurationException : Exception
    {
        public OrganizationMisconfigurationException(string hostname) :
            base("Current org can't be determined. " +
                 "Please ensure the org is configured that has the eventuras hostname " +
                 $"equal to {hostname}")
        {
        }
    }
}
