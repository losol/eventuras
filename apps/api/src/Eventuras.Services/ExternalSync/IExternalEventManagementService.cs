using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.ExternalSync;

public interface IExternalEventManagementService
{
    Task<ExternalEvent> FindExternalEventByLocalIdAsync(int localId);

    Task<List<ExternalEvent>> ListExternalEventsAsync(int eventInfoId);

    /// <exception cref="DuplicateExternalEventException">
    ///     External event with the given <code>serviceProviderName</code> and
    ///     <code>externalEventId</code> is already registered.
    /// </exception>
    Task<ExternalEvent> CreateNewExternalEventAsync(
        int eventInfoId,
        string externalServiceName,
        string externalEventId);

    Task DeleteExternalEventReferenceAsync(int localId);
}
