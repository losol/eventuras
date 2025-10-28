using System;

namespace Eventuras.Services.Invoicing;

/// <summary>
/// Exception thrown when an organization number is not registered for EHF (electronic invoicing).
/// </summary>
public class EhfValidationException : InvoicingException
{
    public string OrganizationNumber { get; }

    public EhfValidationException(string organizationNumber)
        : base($"Organization number {organizationNumber} is not registered for EHF invoicing. " +
               "Please contact the organization to enable EHF, or select email as the invoicing method.")
    {
        OrganizationNumber = organizationNumber;
    }

    public EhfValidationException(string organizationNumber, Exception innerException)
        : base($"Organization number {organizationNumber} is not registered for EHF invoicing. " +
               "Please contact the organization to enable EHF, or select email as the invoicing method.",
            innerException)
    {
        OrganizationNumber = organizationNumber;
    }
}
