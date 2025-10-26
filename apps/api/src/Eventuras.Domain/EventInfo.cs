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
        Other = 9
    }

    public int EventInfoId { get; set; }
    public EventInfoStatus Status { get; set; } = EventInfoStatus.Draft;
    public EventInfoType Type { get; set; } = EventInfoType.Course;

    public string Title { get; set; }
    public string Headline { get; set; }

    [Required]
    public string Slug { get; set; }

    public string Category { get; set; }

    [StringLength(300)]
    [DataType(DataType.MultilineText)]
    public string Description { get; set; }

    public bool Featured { get; set; } = false;

    [DataType(DataType.MultilineText)]
    public string MoreInformation { get; set; }

    [DataType(DataType.MultilineText)]
    public string Program { get; set; }

    [DataType(DataType.MultilineText)]
    public string PracticalInformation { get; set; }

    [DataType(DataType.MultilineText)]
    public string WelcomeLetter { get; set; }

    public bool Published { get; set; } = false;

    [Obsolete]
    public bool ManageRegistrations { get; set; } = false;


    public string ExternalInfoPageUrl { get; set; }

    [Obsolete]
    public string ExternalRegistrationsUrl { get; set; }

    [DataType(DataType.MultilineText)]
    public string InformationRequest { get; set; }

    public string Location { get; set; }

    public string City { get; set; }

    [DataType(DataType.Date)]
    public LocalDate? DateStart { get; set; }

    [DataType(DataType.Date)]
    public LocalDate? DateEnd { get; set; }

    [DataType(DataType.Date)]
    public LocalDate? LastRegistrationDate { get; set; }

    [DataType(DataType.Date)]
    public LocalDate? LastCancellationDate { get; set; }

    public int MaxParticipants { get; set; } = 0;

    public string CertificateTitle { get; set; }

    [DataType(DataType.MultilineText)]
    public string CertificateDescription { get; set; } //Text for the certificate if issued.

    [NotMapped]
    public string CertificateEvidenceDescription
    {
        get
        {
            var evidenceDescription = $"{Title} {City}";
            if (DateStart.HasValue)
            {
                evidenceDescription += " - " + DateStart.Value.ToString("dd.MM.yyyy");
            }

            if (DateEnd.HasValue)
            {
                evidenceDescription += " - " + DateEnd.Value.ToString("dd.MM.yyyy");
            }

            return evidenceDescription;
        }
    }

    public string FeaturedImageUrl { get; set; }

    public string FeaturedImageCaption { get; set; }

    public string ProjectCode { get; set; }

    public int OrganizationId { get; set; }

    public EventInfoOptions Options { get; set; } = new();


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
        if (certificate == null)
        {
            throw new ArgumentNullException(nameof(certificate));
        }

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
