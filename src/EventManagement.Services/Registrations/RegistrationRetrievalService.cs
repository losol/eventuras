using System;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace losol.EventManagement.Services.Registrations
{
    public class RegistrationRetrievalService : IRegistrationRetrievalService
    {
        private readonly ApplicationDbContext _db;

        public RegistrationRetrievalService(ApplicationDbContext db)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
        }

        public async Task<Paging<Registration>> ListRegistrationsAsync(
            IRegistrationRetrievalService.Request request,
            CancellationToken cancellationToken = default)
        {
            var query = _db.Registrations as IQueryable<Registration>;

            if (request.IncludingUser)
            {
                query = query.Include(r => r.User);
            }

            if (request.IncludingEventInfo)
            {
                query = query.Include(r => r.EventInfo);
            }

            if (request.IncludingOrders)
            {
                query = query.Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines);
            }

            if (request.IncludingProducts)
            {
                query = query.Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines)
                    .ThenInclude(l => l.Product);

                query = query.Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines)
                    .ThenInclude(l => l.ProductVariant);
            }

            if (request.VerifiedOnly)
            {
                query = query.Where(r => r.Verified);
            }

            if (request.ActiveUsersOnly)
            {
                query = query.Where(r => !r.User.Archived);
            }

            if (request.HavingEmailConfirmedOnly)
            {
                query = query.Where(r => r.User.EmailConfirmed);
            }

            if (request.NotEnrolledOnly)
            {
                query = query.Where(r => !r.EnrolledInLms);
            }

            if (request.EventInfoId.HasValue)
            {
                query = query.Where(r => r.EventInfoId == request.EventInfoId);
            }

            switch (request.OrderBy)
            {
                case IRegistrationRetrievalService.Order.RegistrationTime:
                    if (request.Descending)
                    {

                        query = query.OrderByDescending(r => r.RegistrationTime);
                    }
                    else
                    {
                        query = query.OrderBy(r => r.RegistrationTime);
                    }
                    break;
            }

            return await Paging<Registration>.CreateAsync(query, request, cancellationToken);
        }
    }
}
