#nullable enable

using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Privacy;

public class PurposeDecisionFormDto
{
    /// <summary>
    ///     Allowed or Denied. For a reservation, Denied is reserving oneself against it;
    ///     for a consent, Allowed is saying yes and Denied is declining or withdrawing.
    /// </summary>
    [Required]
    [EnumDataType(typeof(PurposeDecision.DecisionValue))]
    public PurposeDecision.DecisionValue? Decision { get; set; }
}
