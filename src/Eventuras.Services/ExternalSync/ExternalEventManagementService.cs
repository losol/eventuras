using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Services.ExternalSync
{
    public class ExternalEventManagementService : IExternalEventManagementService
    {
        private readonly ApplicationDbContext _context;

        public ExternalEventManagementService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<ExternalEvent> FindExternalEventByLocalIdAsync(int localId)
        {
            return await _context.ExternalEvents
                .FirstOrDefaultAsync(c => c.LocalId == localId);
        }

        public async Task<List<ExternalEvent>> ListExternalEventsAsync(int eventInfoId)
        {
            return await _context.ExternalEvents
                .Where(c => c.EventInfoId == eventInfoId)
                .OrderBy(c => c.ExternalServiceName)
                .ToListAsync();
        }

        public async Task<ExternalEvent> CreateNewExternalEventAsync(int eventInfoId, string externalServiceName, string externalEventId)
        {
            if (string.IsNullOrEmpty(externalServiceName))
            {
                throw new ArgumentException(nameof(externalServiceName));
            }

            if (string.IsNullOrEmpty(externalEventId))
            {
                throw new ArgumentException(nameof(externalEventId));
            }

            if (await _context.ExternalEvents
                .AnyAsync(c => c.ExternalServiceName == externalServiceName &&
                               c.ExternalEventId == externalEventId))
            {
                FireDuplicateExternalEventException(externalServiceName, externalEventId);
            }

            var newExternalEvent = new ExternalEvent
            {
                EventInfoId = eventInfoId,
                ExternalServiceName = externalServiceName,
                ExternalEventId = externalEventId
            };

            await _context.AddAsync(newExternalEvent);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                FireDuplicateExternalEventException(externalServiceName, externalEventId);
            }

            return newExternalEvent;
        }

        public async Task DeleteExternalEventReferenceAsync(int localId)
        {
            var externalEvent = await _context.ExternalEvents
                .FirstOrDefaultAsync(c => c.LocalId == localId);

            if (externalEvent != null)
            {
                _context.ExternalEvents.Remove(externalEvent);
                await _context.SaveChangesAsync();
            }
        }

        private static void FireDuplicateExternalEventException(string externalServiceName, string externalEventId)
        {
            throw new DuplicateExternalEventException(
                $"Eksternt {externalServiceName} -kurs med id {externalEventId} eksisterer allerede.");
        }
    }
}
