#nullable enable

using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;
using Eventuras.Services.Privacy;

namespace Eventuras.WebApi.Controllers.v3.Privacy;

public class ProcessingPurposeFormDto
{
    /// <summary>Stable identifier, e.g. <c>marketing.newsletter</c>: lowercase words joined by dots or hyphens.</summary>
    [Required]
    [MaxLength(100)]
    [RegularExpression(@"^[a-z0-9]+([.-][a-z0-9]+)*$",
        ErrorMessage = "Code must be lowercase letters and digits, joined by dots or hyphens.")]
    public string Code { get; set; } = string.Empty;

    /// <summary>Consent (denied until the user says yes) or Reservation (allowed until the user says no).</summary>
    [Required]
    [EnumDataType(typeof(ProcessingPurpose.PurposeKind))]
    public ProcessingPurpose.PurposeKind? Kind { get; set; }

    /// <summary>
    ///     Organization (one decision for everything, offered on the profile page) or
    ///     Registration (decided for each registration). Defaults to Organization.
    /// </summary>
    [EnumDataType(typeof(ProcessingPurpose.PurposeScope))]
    public ProcessingPurpose.PurposeScope? Scope { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>The text users are shown and decide on.</summary>
    [Required]
    public string Text { get; set; } = string.Empty;

    /// <summary>Covers GDPR article 9 data, such as dietary requirements. Requires Kind to be Consent.</summary>
    public bool HasSpecialCategoryData { get; set; }

    public NewProcessingPurpose ToNewProcessingPurpose() =>
        new(Code, Kind!.Value, Name, Text, HasSpecialCategoryData,
            Scope ?? ProcessingPurpose.PurposeScope.Organization);
}
