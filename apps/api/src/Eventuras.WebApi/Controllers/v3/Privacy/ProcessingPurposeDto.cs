#nullable enable

using System;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Privacy;

public class ProcessingPurposeDto
{
    public ProcessingPurposeDto() { }

    public ProcessingPurposeDto(ProcessingPurpose purpose)
    {
        ArgumentNullException.ThrowIfNull(purpose);

        Uuid = purpose.Uuid;
        Code = purpose.Code;
        Version = purpose.Version;
        Kind = purpose.Kind;
        Scope = purpose.Scope;
        Name = purpose.Name;
        Text = purpose.Text;
        RequiresReconsent = purpose.RequiresReconsent;
        HasSpecialCategoryData = purpose.HasSpecialCategoryData;
        CreatedAt = purpose.CreatedAt;
    }

    public Guid Uuid { get; set; }

    public string Code { get; set; } = string.Empty;

    public int Version { get; set; }

    public ProcessingPurpose.PurposeKind Kind { get; set; }

    public ProcessingPurpose.PurposeScope Scope { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Text { get; set; } = string.Empty;

    public bool RequiresReconsent { get; set; }

    public bool HasSpecialCategoryData { get; set; }

    public Instant CreatedAt { get; set; }
}
