using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NodaTime;

namespace Eventuras.Domain;

public class EventInfo
{
    public enum EventInfoStatus
    {
        Draft = 0,
        Planned = 1,
        RegistrationsOpen = 2,
        WaitingList = 3,
        RegistrationsClosed = 4,
        Finished = 5,
        Archived = 8,
        Cancelled = 9,
    }

    public enum EventInfoType
    {
        Course = 0,
        Conference = 1,
        OnlineCourse = 2,
        Social = 3,
        Other = 9,
    }

    public int EventInfoId { get; set; }

    public EventInfoStatus Status { get; set; } = EventInfoStatus.Draft;

    public EventInfoType Type { get; set; } = EventInfoType.Course;

    [Display(Name = "Tittel på kurset")]
    public string Title { get; set; }

    public string Headline { get; set; }

    [Required]
    [Display(Name = "Kode for kurset")]
    public string Slug { get; set; }

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

    [Display(Name = "Publisert?")]
    public bool Published { get; set; } = false;

    [Display(Name = "Påmeldinger på kursinord.no?")]
    public bool ManageRegistrations { get; set; } = false;

    [Display(Name = "Url til ekstern informasjonsside om arrangementet")]
    public string ExternalInfoPageUrl { get; set; }

    [Display(Name = "Lenke for ekstern påmelding")]
    public string ExternalRegistrationsUrl { get; set; }

    [Display(Name = "Spør deltaker om ekstra informasjon ved påmelding?")]
    [DataType(DataType.MultilineText)]
    public string InformationRequest { get; set; }

    [Display(Name = "Hvilket hotell?")]
    public string Location { get; set; }

    [Display(Name = "Hvilket sted/by?")]
    public string City { get; set; }

    [Display(Name = "Dato start")]
    [DataType(DataType.Date)]
    public LocalDate? DateStart { get; set; }

    [Display(Name = "Dato slutt")]
    [DataType(DataType.Date)]
    public LocalDate? DateEnd { get; set; }

    [Display(Name = "Påmeldingsfrist", Description = "Frist for påmelding til arrangementet", GroupName = "Frister")]
    [DataType(DataType.Date)]
    public LocalDate? LastRegistrationDate { get; set; }

    [Display(Name = "Avmeldingsfrist", Description = "Frist for å melde seg av arrangementet", GroupName = "Frister")]
    [DataType(DataType.Date)]
    public LocalDate? LastCancellationDate { get; set; }

    [Display(Name = "Antall deltakere", Description = "Maksimalt antall deltakere")]
    public int MaxParticipants { get; set; } = 0; //maks antall deltakere

    [Display(Name = "Diplomtittel - typisk type kurs, f eks Grunnkurs A Allmennmedisin")]
    public string CertificateTitle { get; set; } //Text for the certificate if issued.

    [Display(Name = "Diplomtekst. Inkluder kursnummer og godkjenninger her!")]
    [DataType(DataType.MultilineText)]
    public string CertificateDescription { get; set; } //Text for the certificate if issued.

    [NotMapped]
    public string CertificateEvidenceDescription
    {
        get
        {
            var evidenceDescription = $"{Title} {City}";
            if (DateStart.HasValue) evidenceDescription += " - " + DateStart.Value.ToString("dd.MM.yyyy");

            if (DateEnd.HasValue) evidenceDescription += " - " + DateEnd.Value.ToString("dd.MM.yyyy");

            return evidenceDescription;
        }
    }

    [Display(Name = "Url til bilde for arrangementet")]
    public string FeaturedImageUrl { get; set; }

    [Display(Name = "Bildetekst for arrangementet (Husk fotokreditering)")]
    public string FeaturedImageCaption { get; set; }

    [Display(Name = "Prosjekt-kode for regnskap")]
    public string ProjectCode { get; set; }

    public int OrganizationId { get; set; }

    // Consider to remove this
    public bool Archived { get; set; }

    public string OrganizerUserId { get; set; }

    public bool HasFeaturedImage => !string.IsNullOrWhiteSpace(FeaturedImageUrl);

    public bool HasExternalInfoPage => !string.IsNullOrWhiteSpace(ExternalInfoPageUrl);

    public bool HasExternalRegistrationPage => !string.IsNullOrWhiteSpace(ExternalRegistrationsUrl);

    [Display(Name = "Nettkurs?")]
    public bool OnDemand { get; set; } = false;
    // Consider removing end

    public Certificate FillCertificate(Certificate certificate)
    {
        if (certificate == null) throw new ArgumentNullException(nameof(certificate));

        certificate.Title = Title;
        certificate.Description = CertificateDescription;
        certificate.EvidenceDescription = CertificateEvidenceDescription;
        certificate.IssuingOrganizationName = Organization?.Name ?? "Nordland Legeforening";
        certificate.IssuingOrganizationId = OrganizationId;
        certificate.IssuedByName = OrganizerUser?.Name ?? "Tove Myrbakk";
        certificate.IssuingUserId = OrganizerUserId;
        return certificate;
    }

    #region Navigational properties

    [ForeignKey("OrganizerUserId")]
    public ApplicationUser OrganizerUser { get; set; }

    [ForeignKey("OrganizationId")]
    public Organization Organization { get; set; }

    public List<Registration> Registrations { get; set; }

    public List<Product> Products { get; set; }

    public List<ExternalEvent> ExternalEvents { get; set; }

    public virtual ICollection<EventCollection> Collections { get; set; }

    public virtual List<EventCollectionMapping> CollectionMappings { get; set; }

    #endregion
}