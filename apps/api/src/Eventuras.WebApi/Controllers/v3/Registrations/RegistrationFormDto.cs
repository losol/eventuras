using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

[RegistrationForm]
public class RegistrationFormDto
{
    public RegistrationCustomerInfoDto Customer { get; set; }

    public string Notes { get; set; }

    public Registration.RegistrationType? Type { get; set; }

    public PaymentMethod.PaymentProvider? PaymentMethod { get; set; }

    public bool? FreeRegistration { get; set; }

    public bool Empty => !Type.HasValue &&
                         Notes == null &&
                         Customer == null &&
                         !PaymentMethod.HasValue &&
                         !FreeRegistration.HasValue;

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

        Customer?.CopyTo(registration);

        if (PaymentMethod.HasValue)
        {
            registration.PaymentMethod = PaymentMethod.Value;
        }

        if (FreeRegistration.HasValue)
        {
            registration.FreeRegistration = FreeRegistration.Value;
        }
    }
}
