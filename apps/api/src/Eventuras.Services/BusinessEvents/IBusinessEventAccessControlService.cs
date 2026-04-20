#nullable enable

using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.BusinessEvents;

public interface IBusinessEventAccessControlService
{
    /// <summary>
    ///     Verifies that the current user may list business events for the given
    ///     organization. System admins are unrestricted; org admins must be a
    ///     member of the organization. Throws <see cref="Exceptions.NotAccessibleException"/>
    ///     otherwise, which the WebApi pipeline translates to HTTP 403.
    /// </summary>
    Task CheckListAccessAsync(Guid organizationUuid, CancellationToken cancellationToken = default);
}
