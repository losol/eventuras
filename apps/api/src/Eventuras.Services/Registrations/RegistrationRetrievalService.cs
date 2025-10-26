using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Servcies.Registrations;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Registrations;

public class RegistrationRetrievalService : IRegistrationRetrievalService
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
        CancellationToken cancellationToken = default)
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
        CancellationToken cancellationToken = default)
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
        CancellationToken cancellationToken = default)
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

    public async Task<RegistrationStatistics> GetRegistrationStatisticsAsync(int eventId, CancellationToken cancellationToken = default)
    {
        // Initialize counters for each registration status and type
        var statusCounts = new Dictionary<Registration.RegistrationStatus, int>();
        var typeCounts = new Dictionary<Registration.RegistrationType, int>();

        // Enumerate through all possible values of RegistrationStatus and RegistrationType
        // and initialize their counts to 0
        foreach (var status in Enum.GetValues(typeof(Registration.RegistrationStatus)).Cast<Registration.RegistrationStatus>())
        {
            statusCounts[status] = 0;
        }

        foreach (var type in Enum.GetValues(typeof(Registration.RegistrationType)).Cast<Registration.RegistrationType>())
        {
            typeCounts[type] = 0;
        }

        // Query registrations for the specified event
        var registrations = await _context.Registrations
                                          .Where(r => r.EventInfoId == eventId)
                                          .ToListAsync(cancellationToken);

        // Count the registrations for each status and type
        foreach (var registration in registrations)
        {
            statusCounts[registration.Status]++;
            typeCounts[registration.Type]++;
        }

        // Create ByStatus and ByType objects
        var byStatus = new ByStatus
        {
            Draft = statusCounts[Registration.RegistrationStatus.Draft],
            Cancelled = statusCounts[Registration.RegistrationStatus.Cancelled],
            Verified = statusCounts[Registration.RegistrationStatus.Verified],
            NotAttended = statusCounts[Registration.RegistrationStatus.NotAttended],
            Attended = statusCounts[Registration.RegistrationStatus.Attended],
            Finished = statusCounts[Registration.RegistrationStatus.Finished],
            WaitingList = statusCounts[Registration.RegistrationStatus.WaitingList]
        };

        var byType = new ByType
        {
            Participant = typeCounts[Registration.RegistrationType.Participant],
            Student = typeCounts[Registration.RegistrationType.Student],
            Staff = typeCounts[Registration.RegistrationType.Staff],
            Lecturer = typeCounts[Registration.RegistrationType.Lecturer],
            Artist = typeCounts[Registration.RegistrationType.Artist]
        };

        return new RegistrationStatistics
        {
            ByStatus = byStatus,
            ByType = byType
        };
    }

    public Task<List<RegistrationProductDto>> GetRegistrationProductsAsync(
        Registration registration,
        CancellationToken cancellationToken = default)
    {
        if (registration == null)
            throw new ArgumentNullException(nameof(registration));

        if (registration.Orders == null)
            return Task.FromResult(new List<RegistrationProductDto>());

        var products = registration.Orders
            .Where(o => o.Status != Order.OrderStatus.Cancelled)
            .SelectMany(o => o.OrderLines)
            .GroupBy(ol => new { ol.ProductId, ol.ProductVariantId })
            .Select(group =>
            {
                var first = group.First();
                return new RegistrationProductDto
                {
                    ProductId = first.ProductId ?? 0,
                    ProductVariantId = first.ProductVariantId,
                    Product = first.Product,
                    ProductVariant = first.ProductVariant,
                    Quantity = group.Sum(ol => ol.Quantity)
                };
            })
            .Where(p => p.Quantity != 0)
            .ToList();

        return Task.FromResult(products);
    }
}
