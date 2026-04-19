#nullable enable

using System;
using System.ComponentModel.DataAnnotations;
using Eventuras.WebApi.Models;

namespace Eventuras.WebApi.Controllers.v3.BusinessEvents;

public class BusinessEventsQueryDto : PageQueryDto
{
    /// <summary>
    ///     Subject type to filter on. Free-form string matching the values produced
    ///     by <c>BusinessEventSubjects.For*</c> factories (e.g. "order", "registration", "user").
    /// </summary>
    [Required]
    public string SubjectType { get; set; } = string.Empty;

    /// <summary>The subject entity's Uuid.</summary>
    [Required]
    public Guid SubjectUuid { get; set; }
}
