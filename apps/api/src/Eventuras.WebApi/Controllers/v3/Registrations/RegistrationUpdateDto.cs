using Eventuras.Domain;
using static Eventuras.Domain.Registration;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

public class RegistrationUpdateDto
{
    public RegistrationStatus? Status { get; set; }
    public RegistrationType? Type { get; set; }
    public string Notes { get; set; }
    public RegistrationCustomerInfoDto Customer { get; set; }

    public PaymentMethod.PaymentProvider? PaymentMethod { get; set; }

    public void CopyTo(Registration registration)
    {
        if (Status.HasValue)
        {
            registration.Status = Status.Value;
        }

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
    }
}
