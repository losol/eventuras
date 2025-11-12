using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.ExternalSync;

public interface IExternalSyncProviderService
{
    string Name { get; }

    /// <summary>
    ///     Runs before synchronization. Can perform various checks and throw exceptions
    ///     say if sync can't be done (for example, if no external event is created).
    /// </summary>
    /// <exception cref="ExternalSyncException">Sync cannot be performed.</exception>
    Task SynchronizationCheckAsync(EventInfo eventInfo);

    Task<ExternalAccount> FindExistingAccountAsync(Registration registration);

    Task<ExternalAccount> CreateAccountForUserAsync(Registration registration);

    Task<ExternalEventSyncResult> RunSynchronizationAsync(ExternalAccount account, Registration registration);
}

public enum ExternalEventSyncResult
{
    NotSynced = 0, // Error
    Synced = 1, // OK
    AlreadySynced = 2 // was synced already. no action is performed
}
