using Eventuras.Domain;

namespace Eventuras.Services.Registrations;

public static class RegistrationPageReaderFactory
{
    public static PageReader<Registration> CreateRegistrationPageReader(
        IRegistrationRetrievalService registrationRetrievalService,
        RegistrationListRequest request
    ) =>
        new(async (offset, limit, token) =>
        {
            var registrationRequest = new RegistrationListRequest
            {
                Offset = offset,
                Limit = limit,
                OrderBy = RegistrationListOrder.RegistrationTime,
                Descending = true,
                // Keep the caller's whole filter — rebuilding it from EventInfoId
                // alone dropped HavingStatuses and AccessibleOnly.
                Filter = request.Filter
            };

            var retrievalOptions = new RegistrationRetrievalOptions
            {
                LoadUser = true,
                LoadEventInfo = true,
                LoadOrders = true,
                LoadProducts = true
            };

            return await registrationRetrievalService.ListRegistrationsAsync(
                registrationRequest,
                retrievalOptions,
                token
            );
        });
}
