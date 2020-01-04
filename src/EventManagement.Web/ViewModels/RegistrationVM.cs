using System;
using System.Collections.Generic;
using losol.EventManagement.Domain;
using static losol.EventManagement.Domain.EventInfo;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.ViewModels
{
    public class RegistrationVM
    {
        public int RegistrationId { get; set; }
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        public int EventId { get; set; }
        public EventInfo Event { get; set; }
        public List<Product> Products { get; set; }
        public List<Order> Orders { get; set; }
        public RegistrationStatus Status { get; set; }
        public RegistrationType Type { get; set; }
        public int? CertificateId { get; set; }
        public string Notes { get; set; }
    }
}

