#nullable enable

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Eventuras.Domain;

namespace Eventuras.Services.Privacy;

/// <summary>
///     The signed-in user's own decisions on an organization's processing purposes.
/// </summary>
public interface IPurposeDecisionService
{
    /// <summary>
    ///     The organization's current organization-scoped purposes, each with the user's organization-wide
    ///     decision and what it amounts to now. Ordered by code.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">The caller is not a known user.</exception>
    Task<IReadOnlyList<MyPurpose>> ListMineAsync(
        Organization organization,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Records the user's organization-wide decision on the current version of a
    ///     purpose, and logs the change as a business event on the user.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">The caller is not a known user.</exception>
    /// <exception cref="Exceptions.NotFoundException">
    ///     The organization has no current purpose with the code.
    /// </exception>
    /// <exception cref="Exceptions.ArgumentServiceException">
    ///     The purpose is decided for each registration.
    /// </exception>
    Task<MyPurpose> DecideAsync(
        Organization organization,
        string code,
        PurposeDecision.DecisionValue decision,
        CancellationToken cancellationToken = default);
}

/// <summary>A purpose as it stands for one user.</summary>
/// <param name="Purpose">The current version of the purpose.</param>
/// <param name="Decision">The user's organization-wide decision, if any; it may be on an older version.</param>
/// <param name="Outcome">What the decision amounts to now, from <see cref="PurposeEvaluation"/>.</param>
public sealed record MyPurpose(
    ProcessingPurpose Purpose,
    PurposeDecision? Decision,
    PurposeOutcome Outcome);
