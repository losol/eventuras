using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Models
{
    public enum EventType
    {
        Course,
        Conference,
        Online,
        Blended

    }
   
    public class EventInfo
    {
        public int EventInfoId { get; set; }

        [Display(Name = "Tittel på kurset")]
        public string Title { get; set; }

        [Required]
        [Display(Name = "Kode for kurset")]
        public string Code {get; set;}

        public EventType? EventType { get; set; }

        [Display(Name = "Kort beskrivelse av kurset")]
        [DataType(DataType.MultilineText)]
        public string Description { get; set; }

        [Display(Name = "Klart til publisering?")]
        public bool Publish { get; set; } = false;

        [Display(Name = "Hvilket hotell?")]
        public string Location { get; set; }

        [Display(Name = "Hvilket sted/by?")]
        public string City { get; set; }

        [Display(Name = "Dato start")]
        [DisplayFormat(DataFormatString = "{0:dd.MM.yyyy}", ApplyFormatInEditMode = false)]
        [DataType(DataType.Date)]
        public DateTime? DateStart { get; set; }

        [Display(Name = "Dato slutt")]
        [DisplayFormat(DataFormatString = "{0:dd.MM.yyyy}", ApplyFormatInEditMode = false)]
        [DataType(DataType.Date)]
        public DateTime? DateEnd { get; set; }

        [Display(Name = "Påmeldingsfrist", Description = "Frist for påmelding til arrangementet", GroupName = "Frister")]
        [DataType(DataType.Date)]
        public DateTime? LastRegistrationDate { get; set; }

        [Display(Name = "Avmeldingsfrist", Description = "Frist for å melde seg av arrangementet", GroupName = "Frister")]
        [DataType(DataType.Date)]
        public DateTime? LastCancellationDate { get; set; }

        [Display(Name = "Dato for fakturautsending", Description = "Frist for å melde seg av arrangementet", GroupName = "Frister")]
        [DataType(DataType.Date)]
        public DateTime? InvoiceDate { get; set; }

        [Display(Name = "Antall deltakere", Description = "Maksimalt antall deltakere")]
        public int MaxParticipants { get; set; } = 0; //maks antall deltakere

        [Display(Name = "Pris")]
        [DisplayFormat(DataFormatString = "{0:0}", ApplyFormatInEditMode = true)]
        public decimal Price { get; set; } = 0;

        [Display(Name = "Mva-sats")]
        [DisplayFormat(DataFormatString = "{0:0}", ApplyFormatInEditMode = true)]
        public decimal VatPercent { get; set; } = 0;  //ie0% or 25%

        [Display(Name = "Mer informasjon")]
        [DataType(DataType.MultilineText)]
        public string MoreInformation { get; set; }

        [Display(Name = "Velkomstbrev")]
        [DataType(DataType.MultilineText)]
        public string WelcomeLetter { get; set; } //Text to send to all attendees

        [Display(Name = "Diplomtekst")]
        [DataType(DataType.MultilineText)]
        public string DiplomaDescription { get; set; } //Text to present on the Diploma

        // Add code for attendees here
        public List<Registration> Registrations { get; set; }

    }
}
