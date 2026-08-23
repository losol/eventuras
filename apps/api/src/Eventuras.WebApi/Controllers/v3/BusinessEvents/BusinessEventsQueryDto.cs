#nullable enable

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Eventuras.WebApi.Models;

namespace Eventuras.WebApi.Controllers.v3.BusinessEvents;

/// <summary>
///     Lists business events either for one subject (<see cref="SubjectType" /> +
///     <see cref="SubjectUuid" />) or for everything recorded under one event
///     (<see cref="EventInfoUuid" />). Exactly one of the two selectors is required.
/// </summary>
public class BusinessEventsQueryDto : PageQueryDto, IValidatableObject
{
    /// <summary>
    ///     Subject type to filter on. Free-form string matching the values produced
    ///     by <c>BusinessEventSubjects.For*</c> factories (e.g. "order", "registration", "user").
    ///     Pair with <see cref="SubjectUuid" />.
    /// </summary>
    public string? SubjectType { get; set; }

    /// <summary>The subject entity's Uuid. Pair with <see cref="SubjectType" />.</summary>
    public Guid? SubjectUuid { get; set; }

    /// <summary>
    ///     The event (EventInfo) Uuid: returns every business event recorded on that
    ///     event — the event itself, its registrations and their orders — instead of one subject.
    /// </summary>
    public Guid? EventInfoUuid { get; set; }

    public bool HasSubject => !string.IsNullOrWhiteSpace(SubjectType) && SubjectUuid.HasValue;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var hasSubjectPart = !string.IsNullOrWhiteSpace(SubjectType) || SubjectUuid.HasValue;

        if (hasSubjectPart && !HasSubject)
        {
            yield return new ValidationResult(
                "subjectType and subjectUuid must be given together.",
                [nameof(SubjectType), nameof(SubjectUuid)]);
        }

        if (HasSubject == EventInfoUuid.HasValue)
        {
            yield return new ValidationResult(
                "Specify either subjectType + subjectUuid or eventInfoUuid.",
                [nameof(SubjectType), nameof(SubjectUuid), nameof(EventInfoUuid)]);
        }
    }
}
