using System.Collections.Generic;
using Eventuras.Domain;
using static Eventuras.Domain.Registration;

namespace Eventuras.ViewModels;

public class RegistrationViewModel
{
    public RegistrationViewModel(Registration registration)
    {
        RegistrationId = registration.RegistrationId;
        Event = new EventInfoReference { EventInfoId = registration.EventInfoId };
        Participant = new ParticipantViewModel(registration.User);
        Status = registration.Status;
        Type = registration.Type;
        Notes = registration.Notes;
    }

    public int RegistrationId { get; set; }

    public EventInfoReference Event { get; set; }

    public ParticipantViewModel Participant { get; set; }

    // To be implemented
    public ProductsSummaryViewModel ProductsSummary { get; set; }

    // To be implemeented
    public List<OrderReference> Orders { get; set; }

    public RegistrationStatus Status { get; set; }

    public RegistrationType Type { get; set; }

    public int? CertificateId { get; set; }

    public string Notes { get; set; }
}

public class OrderReference
{
    public int OrderId { get; set; }
    // later this class will include some detail urls and so on
}

public class EventInfoReference
{
    public int EventInfoId { get; set; }
    // later this class will include some detail urls and so on
}