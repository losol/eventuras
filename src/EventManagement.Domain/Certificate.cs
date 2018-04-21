using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace losol.EventManagement.Domain {

    public class Certificate {
        
        [Key]
        public int CertificateId { get; set; }

        // Keys
        [DatabaseGenerated (DatabaseGeneratedOption.Identity)]
        public Guid CertificateGuid { get; set; } = Guid.NewGuid ();
        [DatabaseGenerated (DatabaseGeneratedOption.Identity)]
        public Guid Auth { get; set; } = Guid.NewGuid ();

        [Required]
        public string Title { get; set; }
        public string Description { get; set; }

        // Why this certificate was issued
        public List<Registration> Evidence { get; set; }

        // The recipient of the certificate
        public string RecipientName { get; set; }
        public string RecipientEmail { get; set; }
        public string RecipientUserId { get; set; }
        public ApplicationUser RecipientUser { get; set; }

        // Issued by
        /*
        public int? OrganizationId {get;set;}
        public Organization IssuingOrganization {get;set;}
         */
        public string IssuedByName {get;set;}
        public DateTime IssuedDate { get; set; } = DateTime.UtcNow;

    }
}