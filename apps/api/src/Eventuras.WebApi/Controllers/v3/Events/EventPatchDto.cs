#nullable enable

using System;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Events;

/// <summary>
///     DTO for partial updates to an event.
///     Only allows updating commonly changed fields individually.
///     For comprehensive updates, use PUT endpoint with EventFormDto instead.
/// </summary>
public class EventPatchDto
{
    /// <summary>
    ///     The event type (e.g., Course, Conference).
    /// </summary>
    public EventInfo.EventInfoType? Type { get; set; }

    /// <summary>
    ///     The event status (e.g., Draft, Published, Cancelled).
    /// </summary>
    public EventInfo.EventInfoStatus? Status { get; set; }

    /// <summary>
    ///     The event title.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    ///     URL-friendly slug for the event.
    /// </summary>
    public string? Slug { get; set; }

    /// <summary>
    ///     Short headline for the event.
    /// </summary>
    public string? Headline { get; set; }

    /// <summary>
    ///     Full description of the event (supports Markdown).
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    ///     Whether the event is featured.
    /// </summary>
    public bool? Featured { get; set; }

    /// <summary>
    ///     Whether the event is published and visible to users.
    /// </summary>
    public bool? Published { get; set; }

    /// <summary>
    ///     Event start date.
    /// </summary>
    public LocalDate? DateStart { get; set; }

    /// <summary>
    ///     Event end date.
    /// </summary>
    public LocalDate? DateEnd { get; set; }

    /// <summary>
    ///     Last date for registration.
    /// </summary>
    public LocalDate? LastRegistrationDate { get; set; }

    /// <summary>
    ///     Last date for cancellation.
    /// </summary>
    public LocalDate? LastCancellationDate { get; set; }

    /// <summary>
    ///     Maximum number of participants (0 for unlimited).
    /// </summary>
    public int? MaxParticipants { get; set; }

    /// <summary>
    ///     Event location/venue.
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    ///     City where the event takes place.
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    ///     URL to featured image.
    /// </summary>
    public string? FeaturedImageUrl { get; set; }

    /// <summary>
    ///     External URL for event information.
    /// </summary>
    public string? ExternalInfoPageUrl { get; set; }

    /// <summary>
    ///     Applies the changes from this DTO to an EventInfo entity.
    ///     Only updates fields that are not null.
    /// </summary>
    /// <param name="eventInfo">The event to update</param>
    public void ApplyTo(EventInfo eventInfo)
    {
        if (eventInfo == null)
        {
            throw new ArgumentNullException(nameof(eventInfo));
        }

        if (Type.HasValue)
        {
            eventInfo.Type = Type.Value;
        }

        if (Status.HasValue)
        {
            eventInfo.Status = Status.Value;
        }

        if (Title != null)
        {
            eventInfo.Title = Title;
        }

        if (Slug != null)
        {
            eventInfo.Slug = Slug;
        }

        if (Headline != null)
        {
            eventInfo.Headline = Headline;
        }

        if (Description != null)
        {
            eventInfo.Description = Description;
        }

        if (Featured.HasValue)
        {
            eventInfo.Featured = Featured.Value;
        }

        if (Published.HasValue)
        {
            eventInfo.Published = Published.Value;
        }

        if (DateStart.HasValue)
        {
            eventInfo.DateStart = DateStart;
        }

        if (DateEnd.HasValue)
        {
            eventInfo.DateEnd = DateEnd;
        }

        if (LastRegistrationDate.HasValue)
        {
            eventInfo.LastRegistrationDate = LastRegistrationDate;
        }

        if (LastCancellationDate.HasValue)
        {
            eventInfo.LastCancellationDate = LastCancellationDate;
        }

        if (MaxParticipants.HasValue)
        {
            eventInfo.MaxParticipants = MaxParticipants.Value;
        }

        if (Location != null)
        {
            eventInfo.Location = Location;
        }

        if (City != null)
        {
            eventInfo.City = City;
        }

        if (FeaturedImageUrl != null)
        {
            eventInfo.FeaturedImageUrl = FeaturedImageUrl;
        }

        if (ExternalInfoPageUrl != null)
        {
            eventInfo.ExternalInfoPageUrl = ExternalInfoPageUrl;
        }
    }
}
