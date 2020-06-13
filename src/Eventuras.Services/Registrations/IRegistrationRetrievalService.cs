using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Registrations
{
    public interface IRegistrationRetrievalService
    {
        Task<Paging<Registration>> ListRegistrationsAsync(
            Request request,
            CancellationToken cancellationToken = default);

        public class Request : PagingRequest
        {
            public int? EventInfoId { get; set; }
            public bool IncludingUser { get; set; }
            public bool IncludingEventInfo { get; set; }
            public bool IncludingOrders { get; set; }
            public bool IncludingProducts { get; set; }
            public Order OrderBy { get; set; } = Order.RegistrationTime;
            public bool Descending { get; set; }

            public bool VerifiedOnly { get; set; }

            public bool ActiveUsersOnly { get; set; }

            public bool HavingEmailConfirmedOnly { get; set; }
            public bool NotEnrolledOnly { get; set; }
        }

        public enum Order
        {
            RegistrationTime
        }
    }
}
