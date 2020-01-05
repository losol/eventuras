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
            this.EventInfo = new EventInfoViewModel(registration.EventInfo);
            this.Participant = new ParticipantViewModel(registration.User);
            this.Status = registration.Status;
            this.Type = registration.Type;
        }

        public int RegistrationId { get; set; }
        public ParticipantViewModel Participant { get; set; }
        public EventInfoViewModel EventInfo { get; set; }
        public List<Product> Products { get; set; }
        public List<Order> Orders { get; set; }
        public RegistrationStatus Status { get; set; }
        public RegistrationType Type { get; set; }
        public int? CertificateId { get; set; }
        public string Notes { get; set; }
    }
}

