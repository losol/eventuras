using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace losol.EventManagement.Domain
{
    public class Certificate
    {
        [Key]
        public int CertificateId { get; set; }

        // Keys
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid PublicGuid { get; set; } = Guid.NewGuid();
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid SecretGuid { get; set; } = Guid.NewGuid();
        
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        // Why this certificate was issued
        public List<Registration> Evidence { get; set; }

        public string RecipientUserId { get; set; }
        public string RecipientName { get; set; }
        public string RecipientEmail { get; set; }
        public ApplicationUser RecipientUser { get; set; }

        public CertificateIssuer Issuer { get; set; }
        [ComplexType]
        public class CertificateIssuer
        {
            public int OrganizationId { get; set; }
            public string OrganizationName { get; set; }
            public string OrganizationUrl { get; set; }
            public string OrganizationLogoUrl { get; set; }

            public string IssuedByUserId { get; set; }
            public string IssuedByName { get; set; }
            public string IssuedInCity { get; set; }
            public ApplicationUser IssuedByUser { get; set; }
        }
    }
}
