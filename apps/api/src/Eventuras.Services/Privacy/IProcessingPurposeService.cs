#nullable enable

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Eventuras.Domain;

namespace Eventuras.Services.Privacy;

public interface IProcessingPurposeService
{
    /// <summary>
    ///     The organization's purposes as they stand now: the unretired version of each,
    ///     ordered by code. Retired purposes and superseded versions are left out.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">
    ///     The caller is neither a system admin nor an admin of the organization.
    /// </exception>
    Task<IReadOnlyList<ProcessingPurpose>> ListCurrentAsync(
        Organization organization,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Creates version 1 of a new purpose in the organization. Revising an
    ///     existing purpose is a new version, which this does not do.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">The caller is not a system admin.</exception>
    /// <exception cref="Exceptions.DuplicateException">The organization already has a purpose with the code.</exception>
    /// <exception cref="Exceptions.ArgumentServiceException">
    ///     The purpose covers special category data but is not a consent.
    /// </exception>
    Task<ProcessingPurpose> CreateAsync(
        Organization organization,
        NewProcessingPurpose purpose,
        CancellationToken cancellationToken = default);
}

/// <summary>What a system admin supplies to create a purpose.</summary>
public sealed record NewProcessingPurpose(
    string Code,
    ProcessingPurpose.PurposeKind Kind,
    string Name,
    string Text,
    bool HasSpecialCategoryData,
    ProcessingPurpose.PurposeScope Scope = ProcessingPurpose.PurposeScope.Organization);
