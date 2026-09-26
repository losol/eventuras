#nullable enable

namespace Eventuras.Services.Privacy;

/// <summary>
///     What a user's decision on a processing purpose amounts to right now.
/// </summary>
/// <param name="Status">What the user answered, or why there is no answer.</param>
/// <param name="MayProcess">
///     Whether the organization may process for the purpose. This is the only value
///     enforcement should read. It follows from <paramref name="Status"/> and the
///     purpose kind together: an unanswered reservation is allowed, an unanswered
///     consent is not.
/// </param>
public sealed record PurposeOutcome(PurposeStatus Status, bool MayProcess)
{
    /// <summary>
    ///     Whether the user should be asked. A refusal is an answer and does not set
    ///     this; an unanswered consent, or one a material change invalidated, does.
    /// </summary>
    public bool MustAsk => !MayProcess && Status is PurposeStatus.Unanswered or PurposeStatus.Expired;
}

/// <summary>
///     The user's answer on a purpose, or the reason there is none. Kind-independent:
///     what the answer means for processing is <see cref="PurposeOutcome.MayProcess"/>.
/// </summary>
public enum PurposeStatus
{
    // Nothing on record. For a reservation that is the normal resting state.
    Unanswered = 1,

    // For a consent: said yes. For a reservation: explicitly fine with it.
    Allowed = 2,

    // For a consent: declined or withdrawn. For a reservation: reserved against it.
    Denied = 3,

    // Consented, but on a version a later material change invalidated.
    Expired = 4,

    // The organization has no current version of the purpose, so nothing applies.
    // Named after ProcessingPurpose.RetiredAt, not after withdrawing a consent.
    Retired = 5,

    // The organization has never defined the purpose at all, which is not the same
    // as having retired one it once had.
    Undefined = 6,
}
