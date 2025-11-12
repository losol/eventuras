using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations;

public interface IRegistrationAccessControlService
{
    /// <summary>
    ///     As a logged in user I could only read my own registrations.<br />
    ///     As a logged in admin I could read any registration to an event belonging to organizations I am admin for.<br />
    ///     As a logged in system admin I could read any registration to any event.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">Registration cannot be accessed for read.</exception>
    Task CheckRegistrationReadAccessAsync(Registration registration, CancellationToken cancellationToken = default);

    /// <summary>
    ///     As a logged in user I could register my own participation for an event.<br />
    ///     As a logged in admin I could register any user to an event belonging to organizations I am admin for.<br />
    ///     As a logged in system admin I could register any user to any event.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">Registration cannot be created by the logged in user.</exception>
    Task CheckRegistrationCreateAccessAsync(Registration registration, CancellationToken cancellationToken = default);

    /// <summary>
    ///     As a logged in admin I could edit registrations for events in my own organization.<br />
    ///     As a logged in system admin I could edit registrations for any events.
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">Registration cannot be accessed for update.</exception>
    Task CheckRegistrationUpdateAccessAsync(Registration registration, CancellationToken cancellationToken = default);

    /// <summary>
    ///     Anonymous users are not permitted to list any registrations.<br />
    ///     Admins can list registrations to events of their org.<br />
    ///     Super admins and system admins can read all registrations.<br />
    ///     All other (regular) users may list own registrations only.<br />
    /// </summary>
    /// <exception cref="Exceptions.NotAccessibleException">Anonymous users are not permitted to list any registrations</exception>
    Task<IQueryable<Registration>> AddAccessFilterAsync(IQueryable<Registration> query,
        CancellationToken cancellationToken = default);
}
