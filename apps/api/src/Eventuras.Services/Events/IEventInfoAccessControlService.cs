using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Events;

public interface IEventInfoAccessControlService
{
    /// <summary>
    ///     Checks whether the given even is accessible by the currently signed in user.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">Not permitted to read the given event.</exception>
    Task CheckEventReadAccessAsync(EventInfo eventInfo, CancellationToken cancellationToken = default);

    /// <summary>
    ///     Checks whether the given even is accessible by the currently signed in user.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">Not permitted to update the given event.</exception>
    Task CheckEventManageAccessAsync(EventInfo eventInfo, CancellationToken cancellationToken = default);
}
