using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Registrations;

namespace Eventuras.Services.Registrations;
public static class RegistrationPageReaderFactory
{
    public static PageReader<Registration> CreateRegistrationPageReader(
        IRegistrationRetrievalService registrationRetrievalService,
        RegistrationListRequest request
    )
    {
        return new PageReader<Registration>(async (offset, limit, token) =>
        {
            var registrationRequest = new RegistrationListRequest
            {
                Offset = offset,
                Limit = limit,
                OrderBy = RegistrationListOrder.RegistrationTime,
                Descending = true,
                Filter = new RegistrationFilter
                {
                    EventInfoId = request.Filter.EventInfoId
                }
            };

            var retrievalOptions = new RegistrationRetrievalOptions
            {
                LoadUser = true,
                LoadEventInfo = true,
                LoadOrders = true,
                LoadProducts = true,
            };

            return await registrationRetrievalService.ListRegistrationsAsync(
                registrationRequest,
                retrievalOptions,
                token
            );
        });
    }
}

