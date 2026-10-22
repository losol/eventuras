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
}
