using Eventuras.Domain;
using Eventuras.Services.Registrations;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.ExternalSync
{
    internal class EventSynchronizationService : IEventSynchronizationService
    {
        private readonly IEnumerable<IExternalSyncProviderService> _syncProviderServices;
        private readonly ILogger<EventSynchronizationService> _logger;
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IEventInfoService _eventInfoService;

        public EventSynchronizationService(
            IEnumerable<IExternalSyncProviderService> syncProviderServices,
            ILogger<EventSynchronizationService> logger,
            IRegistrationRetrievalService registrationRetrievalService,
            IEventInfoService eventInfoService)
        {
            _syncProviderServices = syncProviderServices ?? throw new ArgumentNullException(nameof(syncProviderServices));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _registrationRetrievalService = registrationRetrievalService ?? throw new ArgumentNullException(nameof(registrationRetrievalService));
            _eventInfoService = eventInfoService;
        }

        public string[] SyncProviderNames => _syncProviderServices.Select(s => s.Name).ToArray();

        public async Task<EventSynchronizationResult[]> SyncEvent(
            int eventId,
            string syncProviderName,
            CancellationToken cancellationToken)
        {
            var eventInfo = await _eventInfoService.GetAsync(eventId);

            var results = new List<EventSynchronizationResult>();

            var filteredServices = await FilterProvidersAsync(eventInfo, syncProviderName, results);
            foreach (var syncProviderService in filteredServices)
            {
                results.Add(await SyncAllRegistrationsAsync(syncProviderService, eventInfo, cancellationToken));
            }

            return results.ToArray();
        }

        private async Task<EventSynchronizationResult> SyncAllRegistrationsAsync(IExternalSyncProviderService syncProviderService, EventInfo eventInfo,
            CancellationToken cancellationToken)
        {
            var result = new EventSynchronizationResult(syncProviderService.Name);

            var reader = new PageReader<Registration>(async (offset, limit, token) =>
                await _registrationRetrievalService.ListRegistrationsAsync(
                    new IRegistrationRetrievalService.Request
                    {
                        Offset = offset,
                        Limit = limit,
                        EventInfoId = eventInfo?.EventInfoId,
                        IncludingUser = true,
                        IncludingEventInfo = true,
                        VerifiedOnly = true,
                        OrderBy = IRegistrationRetrievalService.Order.RegistrationTime
                    }, token));

            while (await reader.HasMoreAsync(cancellationToken))
            {
                foreach (var registration in await reader.ReadNextAsync(cancellationToken))
                {
                    var externalAccount = await CreateExternalAccountIfNotExists(syncProviderService, registration, result);
                    if (externalAccount != null)
                    {
                        await SyncRegistrationAsync(syncProviderService, registration, externalAccount, result);
                    }
                }
            }

            return result;
        }

        private async Task<List<IExternalSyncProviderService>> FilterProvidersAsync(EventInfo eventInfo,
            string syncProviderName, List<EventSynchronizationResult> results)
        {
            var filteredServices = new List<IExternalSyncProviderService>();
            foreach (var syncProviderService in _syncProviderServices)
            {
                if (!string.IsNullOrEmpty(syncProviderName) &&
                    !string.Equals(syncProviderName, syncProviderService.Name))
                {
                    continue;
                }

                try
                {
                    await syncProviderService.SynchronizationCheckAsync(eventInfo);
                    filteredServices.Add(syncProviderService);
                }
                catch (ExternalSyncException e)
                {
                    results.Add(new EventSynchronizationResult(syncProviderService.Name)
                        .AddGenericError(e));
                }
            }

            return filteredServices;
        }

        private async Task<ExternalAccount> CreateExternalAccountIfNotExists(IExternalSyncProviderService service, Registration registration, EventSynchronizationResult result)
        {
            try
            {
                _logger.LogInformation(
                    "Looking for external {serviceName} account for registration [{registrationId}], user [{userId}]",
                    service.Name,
                    registration.RegistrationId,
                    registration.UserId);

                var existingAccount = await service.FindExistingAccountAsync(registration);
                if (existingAccount != null)
                {
                    _logger.LogInformation("{serviceName} account exists for registration [{registrationId}], user [{userId}]: [{externalAccountId}] ({localAccountId})",
                        service.Name,
                        registration.RegistrationId,
                        registration.UserId,
                        existingAccount.ExternalAccountId,
                        existingAccount.LocalId);

                    result.ExistingUserIds.Add(registration.UserId);
                    return existingAccount;
                }
                else
                {
                    var newAccount = await service.CreateAccountForUserAsync(registration);

                    _logger.LogInformation("New {serviceName} account created for registration [{registrationId}], user [{userId}]: [{externalAccountId}] ({localAccountId})",
                        service.Name,
                        registration.RegistrationId,
                        registration.UserId,
                        newAccount.ExternalAccountId,
                        newAccount.LocalId);

                    result.CreatedUserIds.Add(registration.UserId);
                    return newAccount;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to create new {serviceName} account for user registration [{registrationId}], user [{userId}]",
                    service.Name,
                    registration.RegistrationId,
                    registration.UserId);

                result.UserExportErrors.Add(registration.UserId, e);
                return null;
            }
        }

        private async Task SyncRegistrationAsync(IExternalSyncProviderService service, Registration registration, ExternalAccount externalAccount, EventSynchronizationResult result)
        {
            try
            {
                var syncResult = await service.RunSynchronizationAsync(externalAccount, registration);

                switch (syncResult)
                {
                    case ExternalEventSyncResult.Synced:
                        result.NewRegisteredUserIds.Add(registration.UserId);
                        result.TotalRegisteredUserIds.Add(registration.UserId);
                        break;
                    case ExternalEventSyncResult.AlreadySynced:
                        result.PreviouslyRegisteredUserIds.Add(registration.UserId);
                        result.TotalRegisteredUserIds.Add(registration.UserId);
                        break;
                }
            }
            catch (ExternalEventNotFoundException)
            {
                _logger.LogWarning(
                    "Event info [{eventInfoId}] ({eventInfoTitle}) has no associated {} external event id. Skipping registration sync.",
                    registration.EventInfo.EventInfoId,
                    registration.EventInfo.Title,
                    service.Name);
            }
            catch (Exception e)
            {
                result.UserExportErrors.Add(registration.UserId, e);
            }
        }
    }
}
