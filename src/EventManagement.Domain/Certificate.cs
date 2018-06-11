using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace losol.EventManagement.Domain {

    public class Certificate {
        
        [Key]
        public int CertificateId { get; set; }
        public Guid CertificateGuid { get; set; } = Guid.NewGuid ();
        public Guid Auth { get; set; } = Guid.NewGuid ();

        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public string Comment { get; set; }

        // The recipient of the certificate
        public string RecipientName { get; set; }
        public string RecipientEmail { get; set; }
        public string RecipientUserId { get; set; }
        public ApplicationUser RecipientUser { get; set; }

        // Evidence for the certificate
        public string EvidenceDescription { get; set;}
        public List<CertificateEvidence> Evidence {get;set;}

        // Issued by
        public string IssuingOrganizationName {get;set;}
        public int? IssuingOrganizationId {get;set;}
        public Organization IssuingOrganization {get;set;}

        public string IssuedByName {get;set;}
        public string IssuingUserId {get;set;}
        public ApplicationUser IssuingUser {get;set;}
        
        public string IssuedInCity {get;set;}
        public DateTime IssuedDate { get; set; } = DateTime.UtcNow;

    }
}