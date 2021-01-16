using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Registrations
{
    [RegistrationForm]
    public class RegistrationFormDto
    {
        public RegistrationCustomerInfoDto Customer { get; set; }

        public string Notes { get; set; }

        public Registration.RegistrationType? Type { get; set; }

        public PaymentMethod.PaymentProvider? PaymentMethod { get; set; }

        public void CopyTo(Registration registration)
        {
            if (Type.HasValue)
            {
                registration.Type = Type.Value;
            }

            if (Notes != null)
            {
                registration.Notes = Notes;
            }

            if (Customer != null)
            {
                registration.CustomerName = Customer.Name;
                registration.CustomerEmail = Customer.Email;
                registration.CustomerVatNumber = Customer.VatNumber;
                registration.CustomerCity = Customer.City;
                registration.CustomerCountry = Customer.Country;
                registration.CustomerZip = Customer.Zip;
                registration.CustomerInvoiceReference = Customer.InvoiceReference;
            }

            if (PaymentMethod.HasValue)
            {
                registration.PaymentMethod = PaymentMethod.Value;
            }
        }
    }
}
