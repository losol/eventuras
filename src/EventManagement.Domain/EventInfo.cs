using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{
   
    public class EventInfo
    {
        public int EventInfoId { get; set; }

        [Display(Name = "Tittel på kurset")]
        public string Title { get; set; }

        [Required]
        [Display(Name = "Kode for kurset")]
        public string Code {get; set;}

        public string Category { get; set; }
        
        [StringLength(300, ErrorMessage = "Beskrivelsen kan bare være 300 tegn.")]
        [Display(Name = "Kort beskrivelse av kurset")]
        [DataType(DataType.MultilineText)]
        public string Description { get; set; }

        [Display(Name = "Fremhevet på forsiden?")]
        public bool Featured { get; set; } = false;

        [Display(Name = "Mer informasjon")]
        [DataType(DataType.MultilineText)]
        public string MoreInformation { get; set; }

        [Display(Name = "Program")]
        [DataType(DataType.MultilineText)]
        public string Program { get; set; }

        [Display(Name = "Praktisk informasjon")]
        [DataType(DataType.MultilineText)]
        public string PracticalInformation { get; set; }

        [Display(Name = "Velkomstbrev")]
        [DataType(DataType.MultilineText)]
        public string WelcomeLetter { get; set; }

        [Display(Name = "Nettkurs?")]
        public bool OnDemand { get; set; } = false;

        [Display(Name = "Publisert?")]
        public bool Published { get; set; } = false;

        [Display(Name = "Påmeldinger på kursinord.no?")]
        public bool ManageRegistrations { get; set; } = false;

        [Display(Name = "Lenke for ekstern påmelding")]
        public string RegistrationsUrl { get; set; }

        [Display(Name = "Spør deltaker om ekstra informasjon ved påmelding?")]
        [DataType(DataType.MultilineText)]
        public string InformationRequest { get; set; }

        [Display(Name = "Hvilket hotell?")]
        public string Location { get; set; }

        [Display(Name = "Hvilket sted/by?")]
        public string City { get; set; }

        [Display(Name = "Dato start")]
        [DataType(DataType.Date)]
        public DateTime? DateStart { get; set; }

        [Display(Name = "Dato slutt")]
        [DataType(DataType.Date)]
        public DateTime? DateEnd { get; set; }

        [Display(Name = "Påmeldingsfrist", Description = "Frist for påmelding til arrangementet", GroupName = "Frister")]
        [DataType(DataType.Date)]
        public DateTime? LastRegistrationDate { get; set; }

        [Display(Name = "Avmeldingsfrist", Description = "Frist for å melde seg av arrangementet", GroupName = "Frister")]
        [DataType(DataType.Date)]
        public DateTime? LastCancellationDate { get; set; }

        [Display(Name = "Antall deltakere", Description = "Maksimalt antall deltakere")]
        public int MaxParticipants { get; set; } = 0; //maks antall deltakere

        [Display(Name = "Gratis?")]
        public bool Free { get; set; } = false;

        [Display(Name = "Pris")]
        [DisplayFormat(DataFormatString = "{0:0}", ApplyFormatInEditMode = true)]
        public decimal? Price { get; set; }

        [Display(Name = "Mva-sats")]
        [DisplayFormat(DataFormatString = "{0:0}", ApplyFormatInEditMode = true)]
        public decimal VatPercent { get; set; } = 0;  //ie0% or 25%

        [Display(Name = "Diplomtekst")]
        [DataType(DataType.MultilineText)]
        public string CertificateDescription { get; set; } //Text for the certificate if issued.

        [Display(Name = "Url til bilde for arrangementet")]
        public string FeaturedImageUrl { get; set; } 

        [Display(Name = "Bildetekst for arrangementet (Husk fotokreditering)")]
        public string FeaturedImageCaption { get; set; } 


        // Navigational properties
        public List<Registration> Registrations { get; set; }
        public List<Product> Products {get;set;}

    }
}
