using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Registrations;

public class RegistrationCustomerInfoDto
{
    public string VatNumber { get; set; }

    public string Name { get; set; }

    [EmailAddress]
    public string Email { get; set; }

    public string Zip { get; set; }

    public string City { get; set; }

    public string Country { get; set; }

    public string InvoiceReference { get; set; }
}