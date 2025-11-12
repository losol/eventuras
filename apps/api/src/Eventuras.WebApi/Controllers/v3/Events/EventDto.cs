using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Events;

public class EventDto
{
    public EventDto()
    {
    }

    public EventDto(EventInfo e)
    {
        Id = e.EventInfoId;
        Type = e.Type;
        Status = e.Status;
        Title = e.Title;
        Slug = e.Slug;
        Category = e.Category;
        Description = e.Description;
        Featured = e.Featured;
        Program = e.Program;
        PracticalInformation = e.PracticalInformation;
        OnDemand = e.OnDemand;
        DateStart = e.DateStart;
        DateEnd = e.DateEnd;
        LastRegistrationDate = e.LastRegistrationDate;
        LastCancellationDate = e.LastCancellationDate;
        Location = e.Location;
        City = e.City;
        FeaturedImageUrl = e.FeaturedImageUrl;
        FeaturedImageCaption = e.FeaturedImageCaption;
        Headline = e.Headline;
        Published = e.Published;
        MoreInformation = e.MoreInformation;
        WelcomeLetter = e.WelcomeLetter;
        InformationRequest = e.InformationRequest;
        CertificateTitle = e.CertificateTitle;
        CertificateDescription = e.CertificateDescription;
        ProjectCode = e.ProjectCode;
        OrganizerUserId = e.OrganizerUserId;
        MaxParticipants = e.MaxParticipants;
        ExternalInfoPageUrl = e.ExternalInfoPageUrl;
    }

    public int Id { get; set; }
    public EventInfo.EventInfoType Type { get; set; }
    public EventInfo.EventInfoStatus Status { get; set; }
    public string Title { get; set; }
    public string Slug { get; set; }
    public string Category { get; set; }
    public string Description { get; set; }
    public bool Featured { get; set; }
    public string Program { get; set; }
    public string PracticalInformation { get; set; }
    public string Location { get; set; }
    public string City { get; set; }
    public bool OnDemand { get; set; }
    public LocalDate? DateStart { get; set; }
    public LocalDate? DateEnd { get; set; }
    public LocalDate? LastRegistrationDate { get; set; }
    public LocalDate? LastCancellationDate { get; set; }
    public string FeaturedImageUrl { get; set; }
    public string FeaturedImageCaption { get; set; }
    public string Headline { get; set; }
    public bool Published { get; set; }
    public string MoreInformation { get; set; }
    public string WelcomeLetter { get; set; }
    public string InformationRequest { get; set; }
    public string CertificateTitle { get; set; }
    public string CertificateDescription { get; set; }
    public string ProjectCode { get; set; }
    public string OrganizerUserId { get; set; }
    public int? MaxParticipants { get; set; }
    public string ExternalInfoPageUrl { get; set; }
}
