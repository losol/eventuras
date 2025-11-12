using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Events;

/// <summary>
///     Data Transfer Object (DTO) for Event Information.
///     Used for API between the backend and the frontend.
/// </summary>
public class EventFormDto : IValidatableObject
{
    [Required] public string Title { get; set; }

    [Required] public string Slug { get; set; }

    public int? Id { get; set; }

    public EventInfo.EventInfoType Type { get; set; } = EventInfo.EventInfoType.Course;
    public EventInfo.EventInfoStatus Status { get; set; } = EventInfo.EventInfoStatus.Draft;
    public int OrganizationId { get; set; }
    public string Headline { get; set; }
    public string MoreInformation { get; set; }
    public string Category { get; set; }
    public string Description { get; set; }
    public bool ManageRegistrations { get; set; }
    public bool OnDemand { get; set; }
    public bool Featured { get; set; }
    public string Program { get; set; }
    public string PracticalInformation { get; set; }
    public string Location { get; set; }
    public string City { get; set; }
    public LocalDate? DateStart { get; set; }
    public LocalDate? DateEnd { get; set; }

    public string WelcomeLetter { get; set; }
    public bool Published { get; set; }
    public string ExternalInfoPageUrl { get; set; }
    public string ExternalRegistrationsUrl { get; set; }
    public string InformationRequest { get; set; }
    public LocalDate? LastRegistrationDate { get; set; }
    public LocalDate? LastCancellationDate { get; set; }
    public int? MaxParticipants { get; set; }
    public string CertificateTitle { get; set; }
    public string CertificateDescription { get; set; }
    public string FeaturedImageUrl { get; set; }
    public string FeaturedImageCaption { get; set; }
    public string ProjectCode { get; set; }
    public string OrganizerUserId { get; set; }
    public EventInfoOptionsDto Options { get; set; } = new(new EventInfoOptionsDto.EventInfoRegistrationPolicyDto());

    /// <summary>
    ///     Validates the EventFormDto object.
    /// </summary>
    /// <param name="validationContext">The context in which to validate the object.</param>
    /// <returns>A list of ValidationResults if validation fails, otherwise an empty list.</returns>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DateStart.HasValue && DateEnd.HasValue && DateStart.Value > DateEnd.Value)
        {
            yield return new ValidationResult("start date must precede end date",
                new List<string> { nameof(DateStart), nameof(DateEnd) });
        }
    }

    /// <summary>
    ///     Copies the DTO properties into the EventInfo domain model.
    /// </summary>
    /// <param name="eventInfo">The EventInfo domain model to update.</param>
    public void CopyTo(EventInfo eventInfo)
    {
        if (eventInfo == null)
        {
            throw new ArgumentNullException(nameof(eventInfo));
        }

        eventInfo.Type = Type;
        eventInfo.Status = Status;
        eventInfo.Title = Title;
        eventInfo.Slug = Slug;
        eventInfo.OrganizationId = OrganizationId;
        eventInfo.Category = Category;
        eventInfo.Description = Description;
        eventInfo.ManageRegistrations = ManageRegistrations;
        eventInfo.OnDemand = OnDemand;
        eventInfo.Featured = Featured;
        eventInfo.Program = Program;
        eventInfo.PracticalInformation = PracticalInformation;
        eventInfo.Location = Location;
        eventInfo.City = City;
        eventInfo.DateStart = DateStart;
        eventInfo.DateEnd = DateEnd;
        eventInfo.Headline = Headline;
        eventInfo.MoreInformation = MoreInformation;
        eventInfo.WelcomeLetter = WelcomeLetter;
        eventInfo.Published = Published;
        eventInfo.ExternalInfoPageUrl = ExternalInfoPageUrl;
        eventInfo.ExternalRegistrationsUrl = ExternalRegistrationsUrl;
        eventInfo.InformationRequest = InformationRequest;
        eventInfo.LastRegistrationDate = LastRegistrationDate;
        eventInfo.LastCancellationDate = LastCancellationDate;
        eventInfo.MaxParticipants = MaxParticipants ?? 0;
        eventInfo.CertificateTitle = CertificateTitle;
        eventInfo.CertificateDescription = CertificateDescription;
        eventInfo.FeaturedImageUrl = FeaturedImageUrl;
        eventInfo.FeaturedImageCaption = FeaturedImageCaption;
        eventInfo.ProjectCode = ProjectCode;
        eventInfo.OrganizerUserId = OrganizerUserId;
        eventInfo.Options = Options.MapToEntity();
    }

    /// <summary>
    ///     Creates an EventFormDto object from an EventInfo entity.
    /// </summary>
    /// <param name="entity">The EventInfo entity to convert.</param>
    /// <returns>An EventFormDto object containing the data from the EventInfo entity.</returns>
    public static EventFormDto FromEntity(EventInfo entity) =>
        new()
        {
            Title = entity.Title,
            Slug = entity.Slug,
            Headline = entity.Headline,
            Type = entity.Type,
            Status = entity.Status,
            OrganizationId = entity.OrganizationId,
            Category = entity.Category,
            Description = entity.Description,
            ManageRegistrations = entity.ManageRegistrations,
            OnDemand = entity.OnDemand,
            Featured = entity.Featured,
            Program = entity.Program,
            PracticalInformation = entity.PracticalInformation,
            Location = entity.Location,
            City = entity.City,
            DateStart = entity.DateStart,
            DateEnd = entity.DateEnd,
            MoreInformation = entity.MoreInformation,
            WelcomeLetter = entity.WelcomeLetter,
            Published = entity.Published,
            ExternalInfoPageUrl = entity.ExternalInfoPageUrl,
            ExternalRegistrationsUrl = entity.ExternalRegistrationsUrl,
            InformationRequest = entity.InformationRequest,
            LastRegistrationDate = entity.LastRegistrationDate,
            LastCancellationDate = entity.LastCancellationDate,
            MaxParticipants = entity.MaxParticipants,
            CertificateTitle = entity.CertificateTitle,
            CertificateDescription = entity.CertificateDescription,
            FeaturedImageUrl = entity.FeaturedImageUrl,
            FeaturedImageCaption = entity.FeaturedImageCaption,
            ProjectCode = entity.ProjectCode,
            OrganizerUserId = entity.OrganizerUserId,
            Options = EventInfoOptionsDto.MapFromEntity(entity.Options)
        };
}
