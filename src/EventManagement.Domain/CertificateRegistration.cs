using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace losol.EventManagement.Domain {

    public class CertificateRegistration {

        public int CertificateId { get; set; }
        public Certificate Certificate { get; set; }

        public int RegistrationId { get; set; }
        public Registration Registration { get; set; }
    }
}