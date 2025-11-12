using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using DbUpdateException = Microsoft.EntityFrameworkCore.DbUpdateException;

namespace Eventuras.Services.ExternalSync;

/// <summary>
///     External event synchronization stub. Common approach to external synchronization
///     is to make checks whether the external event is registered in the system,
///     whether the external account exists and create one if it doesn't. All external system
///     interactions are delegated to the descendant classes.
/// </summary>
public abstract class AbstractExternalSyncProviderService : IExternalSyncProviderService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger _logger;

    protected AbstractExternalSyncProviderService(ApplicationDbContext context, ILogger logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public abstract string Name { get; }

    public virtual async Task SynchronizationCheckAsync(EventInfo eventInfo)
    {
        if (eventInfo == null)
        {
            throw new ArgumentNullException(nameof(eventInfo));
        }

        await EnsureExternalEventAsync(eventInfo);
    }

    public virtual async Task<ExternalEventSyncResult> RunSynchronizationAsync(ExternalAccount account,
        Registration registration)
    {
        if (account == null)
        {
            throw new ArgumentException(nameof(account));
        }

        if (registration == null)
        {
            throw new ArgumentException(nameof(registration));
        }

        if (registration.EventInfo == null)
        {
            throw new ArgumentException(nameof(registration));
        }

        var externalEvent = await EnsureExternalEventAsync(registration.EventInfo);
        if (externalEvent == null)
        {
            return ExternalEventSyncResult.NotSynced;
        }

        if (await _context.ExternalRegistrations
                .AnyAsync(e => e.ExternalEventId == externalEvent.LocalId &&
                               e.ExternalAccountId == account.LocalId))
        {
            return ExternalEventSyncResult.AlreadySynced;
        }

        await RegisterUserToExternalEventAsync(account, externalEvent);

        var externalRegistration = new ExternalRegistration
        {
            ExternalEvent = externalEvent,
            ExternalAccount = account,
            Registration = registration
        };

        try
        {
            await _context.CreateAsync(externalRegistration);
        }
        catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
        {
            _logger.LogWarning(e, "Database update failed because of non-unique key: {ExceptionMessage}", e.Message);
            _context.ExternalRegistrations.Remove(externalRegistration);
            return ExternalEventSyncResult.AlreadySynced;
        }

        return ExternalEventSyncResult.Synced;
    }

    public abstract Task<ExternalAccount> FindExistingAccountAsync(Registration registration);

    public async Task<ExternalAccount> CreateAccountForUserAsync(Registration registration)
    {
        if (registration == null)
        {
            throw new ArgumentNullException(nameof(registration));
        }

        if (registration.Status == Registration.RegistrationStatus.Draft)
        {
            throw new InvalidOperationException($"Registration {registration.RegistrationId} is not verified");
        }

        var externalAccount = await CreateNewExternalAccountForRegistrationAsync(registration);

        try
        {
            await _context.CreateAsync(externalAccount);
            return externalAccount;
        }
        catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
        {
            _logger.LogWarning(e, "Database update failed because of non-unique key: {ExceptionMessage}", e.Message);
            _context.ExternalAccounts.Remove(externalAccount);
            return await FindExistingAccountAsync(registration);
        }
    }

    /// <summary>
    ///     Implementation may decide to perform some actions in addition to just creating external account.
    ///     Default is do nothing.
    /// </summary>
    protected virtual Task RegisterUserToExternalEventAsync(ExternalAccount account, ExternalEvent externalEvent) =>
        Task.CompletedTask; // Do nothing by default

    /// <summary>
    ///     Creates new <see cref="ExternalAccount" /> for the given registration.
    ///     Implementation may decide to perform additional checks whether the account is already exists in the external
    ///     service
    ///     and re-use the existing data or create new record.
    /// </summary>
    /// <param name="registration">Not null.</param>
    /// <returns>Not null.</returns>
    protected abstract Task<ExternalAccount> CreateNewExternalAccountForRegistrationAsync(Registration registration);


    /// <summary>
    ///     Checks whether the external event setup is properly done for the given event info and returns
    ///     the corresponding external event object or throws <see cref="ExternalSyncException" /> in case of any issues.
    /// </summary>
    /// <param name="eventInfo">Local event info.</param>
    /// <returns>Not null</returns>
    /// <exception cref="ExternalSyncException">External event not found or misconfigured.</exception>
    protected virtual async Task<ExternalEvent> EnsureExternalEventAsync(EventInfo eventInfo)
    {
        var externalEvent = await _context.ExternalEvents.FirstOrDefaultAsync(c => c.ExternalServiceName == Name &&
            c.EventInfoId == eventInfo.EventInfoId);

        if (externalEvent == null)
        {
            throw new ExternalEventNotFoundException($"No external events configured for event {eventInfo.Title}");
        }

        return externalEvent;
    }
}
