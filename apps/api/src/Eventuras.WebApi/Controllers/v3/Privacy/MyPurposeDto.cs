#nullable enable

using System;
using Eventuras.Domain;
using Eventuras.Services.Privacy;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Privacy;

/// <summary>A processing purpose as it stands for the signed-in user.</summary>
public class MyPurposeDto
{
    public MyPurposeDto() { }

    public MyPurposeDto(MyPurpose myPurpose)
    {
        ArgumentNullException.ThrowIfNull(myPurpose);

        Purpose = new ProcessingPurposeDto(myPurpose.Purpose);
        Status = myPurpose.Outcome.Status;
        MayProcess = myPurpose.Outcome.MayProcess;
        MustAsk = myPurpose.Outcome.MustAsk;
        Decision = myPurpose.Decision?.Decision;
        DecidedAt = myPurpose.Decision?.DecidedAt;
    }

    public ProcessingPurposeDto Purpose { get; set; } = new();

    /// <summary>What the user answered, or why there is no answer.</summary>
    public PurposeStatus Status { get; set; }

    /// <summary>Whether the organization may process for the purpose. The value to enforce.</summary>
    public bool MayProcess { get; set; }

    /// <summary>Whether the user should be asked: an unanswered or expired consent.</summary>
    public bool MustAsk { get; set; }

    /// <summary>The user's stored decision, if any. It may be on an earlier version of the purpose.</summary>
    public PurposeDecision.DecisionValue? Decision { get; set; }

    public Instant? DecidedAt { get; set; }
}
