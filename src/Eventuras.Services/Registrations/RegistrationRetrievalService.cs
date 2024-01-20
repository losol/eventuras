using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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
                                   .WithOptions(options)
                                   .FirstOrDefaultAsync(r => r.RegistrationId == id, cancellationToken)
                               ?? throw new NotFoundException($"Registration {id} not found.");

            if (options.ForUpdate)
            {
                await _registrationAccessControlService
                    .CheckRegistrationUpdateAccessAsync(registration, cancellationToken);
            }
            else
            {
                await _registrationAccessControlService
                    .CheckRegistrationReadAccessAsync(registration, cancellationToken);
            }

            return registration;
        }

        public async Task<Registration> FindRegistrationAsync(
            RegistrationFilter filter,
            RegistrationRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            options ??= RegistrationRetrievalOptions.Default;

            var query = _context.Registrations
                .WithOptions(options)
                .AddFilter(filter);

            if (filter.AccessibleOnly)
            {
                query = await _registrationAccessControlService
                    .AddAccessFilterAsync(query, cancellationToken);
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
                .WithOptions(options)
                .AddFilter(request.Filter)
                .AddOrder(request.OrderBy, request.Descending);

            if (request.Filter.AccessibleOnly)
            {
                query = await _registrationAccessControlService
                    .AddAccessFilterAsync(query, cancellationToken);
            }

            return await Paging.CreateAsync(query, request, cancellationToken);
        }

        public async Task<Dictionary<Registration.RegistrationStatus, int>> GetRegistrationStatisticsAsync(int eventId, CancellationToken cancellationToken)
        {
            return await _context.Registrations
                .Where(r => r.EventInfoId == eventId)
                .GroupBy(r => r.Status)
                .Select(group => new { Status = group.Key, Count = group.Count() })
                .ToDictionaryAsync(g => g.Status, g => g.Count, cancellationToken);
        }
    }
}
