using System;
using System.Collections.Generic;
using Eventuras.Domain;
using static Eventuras.Domain.EventInfo;
using static Eventuras.Domain.Registration;

namespace Eventuras.WebApi.Models
{
    public class RegistrationDto
    {
        public RegistrationDto(Registration registration)
        {
            this.RegistrationId = registration.RegistrationId;
            this.EventId = registration.EventInfoId;
            this.UserId = registration.UserId;
            this.Status = registration.Status;
            this.Type = registration.Type;
            this.Notes = registration.Notes;
        }

        public int RegistrationId { get; set; }
        public int EventId { get; set; }
        public string UserId { get; set; }
        public RegistrationStatus Status { get; set; }
        public RegistrationType Type { get; set; }
        public int? CertificateId { get; set; }
        public string Notes { get; set; }
    }
}
