using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace losol.EventManagement.Domain {

    public class CertificateEvidence {
        
        [Key]
        public int CertificateEvidenceId { get; set; }

        public int RegistrationId { get; set; }
        public Registration Registration {get;set;}

    }
}