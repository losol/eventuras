using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain
{
    public class Organization
    {
        public int OrganizationId { get; set; }

        [DisplayName("Foreldreorganisasjon")]
        public int? ParentOrganizationId { get; set; }

        [Required]
        [Display(Name = "Navn")]
        public string Name { get; set; }

        [StringLength(300, ErrorMessage = "Beskrivelsen kan bare være 300 tegn.")]
        [Display(Name = "Kort beskrivelse av organisasjonen.")]
        [DataType(DataType.MultilineText)]
        public string Description { get; set; }

        [StringLength(300, ErrorMessage = "Lenken kan bare være 300 tegn.")]
        [Display(Name = "Lenke til organisasjonens nettsted")]
        public string Url { get; set; }

        [StringLength(100, ErrorMessage = "Telefonnummeret kan bare være 50 tegn.")]
        [Display(Name = "Telefon til organisasjonen.")]
        public string Phone { get; set; }

        [StringLength(300, ErrorMessage = "Eposten kan bare være 300 tegn.")]
        [Display(Name = "Epost til organisasjonen.")]
        public string Email { get; set; }

        [StringLength(300, ErrorMessage = "Logo-url kan bare være 300 tegn.")]
        [Display(Name = "Lenke til profilbilde for organisasjonen.")]
        public string LogoUrl { get; set; }
        public string LogoBase64 { get; set; }

        public string VatId { get; set; }
        public string AccountNumber { get; set; }

        [DisplayName("Aktiv")]
        public bool Active { get; set; } = true;

        [StringLength(300, ErrorMessage = "Eventuras vertsnavn kan bare være 300 tegn.")]
        [Display(Name = "Eventuras vertsnavn")]
        public string EventurasHostname { get; set; }

        [DisplayName("Foreldreorganisasjon")]
        [ForeignKey(nameof(ParentOrganizationId))]
        public Organization ParentOrganization { get; set; }

        public List<Organization> ChildOrganizations { get; set; }

        public List<OrganizationMember> Members { get; set; }
    }
}
