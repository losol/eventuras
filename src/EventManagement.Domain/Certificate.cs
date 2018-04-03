using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace losol.EventManagement.Domain
{
    public class Certificate
    {
        [Key]
        public int CertificateId { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid CertificateGuid { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid AuthCode { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        // The person receiving the certificate
        public string RecipientUserId { get; set; }
        public string RecipientName { get; set; }


        public CertificateIssuer Issuer { get; set; }

        [ComplexType]
        public class CertificateIssuer
        {
            public int OrganizationId { get; set; }
            public string OrganizationName { get; set; }
            public string OrganizationLogoUrl { get; set; }

            public string IssuedByUserId { get; set; }
            public string IssuedByName { get; set; }
            public ApplicationUser IssuedByUser { get; set; }
        }
    }
}
