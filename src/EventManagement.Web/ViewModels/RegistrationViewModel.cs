using System;
using System.Collections.Generic;
using losol.EventManagement.Domain;
using static losol.EventManagement.Domain.EventInfo;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.ViewModels
{
    public class RegistrationViewModel
    {
        public RegistrationViewModel(Registration registration)
        {
            this.RegistrationId = registration.RegistrationId;
            this.Event = new EventInfoReference() {EventInfoId = registration.EventInfoId} ;
            this.Participant = new ParticipantViewModel(registration.User);
            this.Status = registration.Status;
            this.Type = registration.Type;
            this.Notes = registration.Notes;
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
}

