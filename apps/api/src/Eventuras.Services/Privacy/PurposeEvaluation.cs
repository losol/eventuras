#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;

using Eventuras.Domain;

namespace Eventuras.Services.Privacy;

/// <summary>
///     Turns a purpose and a user's decision into an answer. Pure, so it holds the
///     rules in one place: every caller that asks whether something may be processed
///     goes through here rather than reading <see cref="PurposeDecision.Decision"/>.
/// </summary>
public static class PurposeEvaluation
{
    /// <summary>
    ///     Evaluates one purpose for one user.
    /// </summary>
    /// <param name="versions">
    ///     Every version of the purpose, for one organization and code. At most one
    ///     may be unretired; that one is the current version.
    /// </param>
    /// <param name="organizationWide">The decision covering the whole organization, if any.</param>
    /// <param name="forRegistration">
    ///     The decision scoped to the registration being asked about, if any. Takes
    ///     precedence: it is a narrower answer to the same question.
    /// </param>
    public static PurposeOutcome Evaluate(
        IReadOnlyCollection<ProcessingPurpose> versions,
        PurposeDecision? organizationWide = null,
        PurposeDecision? forRegistration = null)
    {
        ArgumentNullException.ThrowIfNull(versions);

        // The organization has never defined the purpose. A legitimate question to
        // ask of an organization that simply has no such purpose, so it answers
        // rather than throws — but it is not the same as having retired one.
        if (versions.Count == 0)
        {
            return new PurposeOutcome(PurposeStatus.Undefined, MayProcess: false);
        }

        var current = CurrentVersion(versions);

        // Every version is retired: the purpose is out of use.
        if (current is null)
        {
            return new PurposeOutcome(PurposeStatus.Retired, MayProcess: false);
        }

        var decision = Applicable(organizationWide, forRegistration);

        // Resolved on every path, not only where the version is needed: a caller
        // passing a partial or mismatched version list is told, never answered.
        var decidedOn = decision is null ? null : VersionDecidedOn(versions, decision);

        return current.Kind switch
        {
            ProcessingPurpose.PurposeKind.Consent => EvaluateConsent(versions, decision, decidedOn),
            ProcessingPurpose.PurposeKind.Reservation => EvaluateReservation(decision),
            _ => throw new ArgumentException(
                $"Purpose '{current.Code}' has an unknown kind {current.Kind}.",
                nameof(versions))
        };
    }

    /// <summary>
    ///     The decision that answers for a registration: the registration-scoped one
    ///     when the user gave one, otherwise the organization-wide one.
    /// </summary>
    public static PurposeDecision? Applicable(
        PurposeDecision? organizationWide,
        PurposeDecision? forRegistration)
        => forRegistration ?? organizationWide;

    /// <summary>
    ///     The current version of a purpose: the one that has not been retired. Null
    ///     once every version is retired, which is how a purpose goes out of use, and
    ///     for an empty collection. The versions must all belong to one organization's
    ///     one code, agree on kind, run without gaps, and put the unretired one last.
    ///     Callers must supply every version; a set missing one above or below the range
    ///     given cannot be detected from here, and the query is responsible for that.
    /// </summary>
    public static ProcessingPurpose? CurrentVersion(IReadOnlyCollection<ProcessingPurpose> versions)
    {
        ArgumentNullException.ThrowIfNull(versions);

        var purposes = versions.Select(v => (v.OrganizationUuid, v.Code)).Distinct().ToList();
        if (purposes.Count > 1)
        {
            throw new ArgumentException(
                $"Versions span {purposes.Count} purposes; they must all be one organization's one code.",
                nameof(versions));
        }

        var kinds = versions.Select(v => v.Kind).Distinct().ToList();
        if (kinds.Count > 1)
        {
            throw new ArgumentException(
                "Versions disagree on kind. A purpose that moves between consent and "
                + "reservation is a new purpose, not a new version: its earlier decisions "
                + "were given under the old kind and must not be read under the new one.",
                nameof(versions));
        }

        // A missing version may be the material change that expires a consent, and its
        // absence would read as a consent that still counts.
        var numbers = versions.Select(v => v.Version).OrderBy(n => n).ToList();
        for (var i = 1; i < numbers.Count; i++)
        {
            if (numbers[i] != numbers[i - 1] + 1)
            {
                throw new ArgumentException(
                    $"Versions jump from {numbers[i - 1]} to {numbers[i]}; every version must be supplied.",
                    nameof(versions));
            }
        }

        var unretired = versions.Where(v => v.RetiredAt is null).ToList();
        if (unretired.Count > 1)
        {
            throw new ArgumentException(
                $"Purpose '{unretired[0].Code}' has {unretired.Count} unretired versions; at most one is allowed.",
                nameof(versions));
        }

        var current = unretired.SingleOrDefault();
        if (current is not null && current.Version != numbers[^1])
        {
            throw new ArgumentException(
                $"Version {current.Version} is the unretired one but {numbers[^1]} is higher; "
                + "the current version must be the latest.",
                nameof(versions));
        }

        return current;
    }

    /// <summary>
    ///     The lowest version a consent must have been given on to still count. Null
    ///     when no version has ever been a material change.
    /// </summary>
    public static int? ReconsentRequiredFromVersion(IEnumerable<ProcessingPurpose> versions)
    {
        ArgumentNullException.ThrowIfNull(versions);

        var materialChanges = versions
            .Where(v => v.RequiresReconsent)
            .Select(v => (int?)v.Version)
            .ToList();

        return materialChanges.Count == 0 ? null : materialChanges.Max();
    }

    // Nothing may be processed until the user has said yes, on a version no later
    // change has invalidated. Special-category purposes are consents by a check
    // constraint, so they need no separate rule here.
    private static PurposeOutcome EvaluateConsent(
        IReadOnlyCollection<ProcessingPurpose> versions,
        PurposeDecision? decision,
        ProcessingPurpose? decidedOn)
    {
        if (decision is null || decidedOn is null)
        {
            return new PurposeOutcome(PurposeStatus.Unanswered, MayProcess: false);
        }

        if (decision.Decision == PurposeDecision.DecisionValue.Denied)
        {
            return new PurposeOutcome(PurposeStatus.Denied, MayProcess: false);
        }

        var validFrom = ReconsentRequiredFromVersion(versions);
        var expired = validFrom is not null && decidedOn.Version < validFrom;

        return expired
            ? new PurposeOutcome(PurposeStatus.Expired, MayProcess: false)
            : new PurposeOutcome(PurposeStatus.Allowed, MayProcess: true);
    }

    // Allowed until the user says no. A rewritten purpose text does not revive
    // processing the user has already reserved against, so expiry is not considered
    // — and an explicit Allowed matches the default anyway.
    private static PurposeOutcome EvaluateReservation(PurposeDecision? decision)
    {
        if (decision is null)
        {
            return new PurposeOutcome(PurposeStatus.Unanswered, MayProcess: true);
        }

        var reserved = decision.Decision == PurposeDecision.DecisionValue.Denied;

        return reserved
            ? new PurposeOutcome(PurposeStatus.Denied, MayProcess: false)
            : new PurposeOutcome(PurposeStatus.Allowed, MayProcess: true);
    }

    private static ProcessingPurpose VersionDecidedOn(
        IReadOnlyCollection<ProcessingPurpose> versions,
        PurposeDecision decision)
        => versions.SingleOrDefault(v => v.Uuid == decision.ProcessingPurposeUuid)
            ?? throw new ArgumentException(
                $"Decision {decision.Uuid} was made on purpose version {decision.ProcessingPurposeUuid}, "
                + "which is not among the versions given.",
                nameof(versions));
}
