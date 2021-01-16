using System;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Exceptions;

namespace Eventuras.Services.Registrations
{
    internal class RegistrationRetrievalService : IRegistrationRetrievalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IRegistrationAccessControlService _registrationAccessControlService;

        public RegistrationRetrievalService(
            ApplicationDbContext context,
            IRegistrationAccessControlService registrationAccessControlService)
        {
            _context = context ?? throw
                new ArgumentNullException(nameof(context));

            _registrationAccessControlService = registrationAccessControlService ?? throw
                new ArgumentNullException(nameof(registrationAccessControlService));
        }

        public async Task<Registration> GetRegistrationByIdAsync(int id,
            RegistrationRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            options ??= RegistrationRetrievalOptions.Default;

            var registration = await _context.Registrations
                .AsNoTracking()
                .WithOptions(options)
                .Where(r => r.RegistrationId == id)
                .FirstOrDefaultAsync(cancellationToken);

            if (registration == null)
            {
                throw new NotFoundException($"Registration {id} not found.");
            }

            await _registrationAccessControlService
                .CheckRegistrationReadAccessAsync(registration);

            return registration;
        }

        public async Task<Registration> FindRegistrationAsync(
            RegistrationFilter filter,
            RegistrationRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            options ??= RegistrationRetrievalOptions.Default;

            var query = _context.Registrations
                .AsNoTracking()
                .WithOptions(options)
                .AddFilter(filter);

            if (filter.AccessibleOnly)
            {
                query = await _registrationAccessControlService
                    .AddAccessFilterAsync(query);
            }

            return await query.FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<Paging<Registration>> ListRegistrationsAsync(
            RegistrationListRequest request,
            RegistrationRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            options ??= RegistrationRetrievalOptions.Default;

            var query = _context.Registrations
                .AsNoTracking()
                .WithOptions(options)
                .AddFilter(request.Filter)
                .AddOrder(request.OrderBy, request.Descending);

            if (request.Filter.AccessibleOnly)
            {
                query = await _registrationAccessControlService
                    .AddAccessFilterAsync(query);
            }

            return await Paging<Registration>.CreateAsync(query, request, cancellationToken);
        }
    }
}
