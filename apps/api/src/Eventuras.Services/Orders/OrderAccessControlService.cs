using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Http;

namespace Eventuras.Services.Orders;

public class OrderAccessControlService : IOrderAccessControlService
{
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IRegistrationAccessControlService _registrationAccessControlService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public OrderAccessControlService(
        IHttpContextAccessor httpContextAccessor,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        IRegistrationAccessControlService registrationAccessControlService,
        IRegistrationRetrievalService registrationRetrievalService)
    {
        _httpContextAccessor = httpContextAccessor ?? throw
            new ArgumentNullException(nameof(httpContextAccessor));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));

        _registrationAccessControlService = registrationAccessControlService ?? throw
            new ArgumentNullException(nameof(registrationAccessControlService));

        _registrationRetrievalService = registrationRetrievalService ?? throw
            new ArgumentNullException(nameof(registrationRetrievalService));
    }

    public async Task CheckOrderReadAccessAsync(
        Order order,
        CancellationToken cancellationToken)
    {
        if (order == null)
        {
            throw new ArgumentNullException(nameof(order));
        }

        var registration = await GetOrderRegistrationAsync(order, cancellationToken);

        await _registrationAccessControlService
            .CheckRegistrationReadAccessAsync(registration, cancellationToken);
    }

    public async Task CheckOrderUpdateAccessAsync(Order order, CancellationToken cancellationToken = default)
    {
        if (order == null)
        {
            throw new ArgumentNullException(nameof(order));
        }

        var registration = await GetOrderRegistrationAsync(order, cancellationToken);

        await _registrationAccessControlService
            .CheckRegistrationUpdateAccessAsync(registration, cancellationToken);
    }

    public async Task<bool> HasAdminAccessAsync(Order order, CancellationToken cancellationToken = default)
    {
        if (order == null)
        {
            throw new ArgumentNullException(nameof(order));
        }

        var user = _httpContextAccessor.HttpContext.User;
        if (user.IsAnonymous())
        {
            throw new NotAccessibleException("Anonymous users are never admins.");
        }

        if (user.IsPowerAdmin())
        {
            return true;
        }

        if (!user.IsAdmin())
        {
            return false;
        }

        var org = await _currentOrganizationAccessorService
            .RequireCurrentOrganizationAsync(new OrganizationRetrievalOptions { LoadMembers = true },
                cancellationToken);

        if (org.Members.Exists(m => m.UserId == user.GetUserId() && m.HasRole(Roles.Admin)))
        {
            return true;
        }

        return false;
    }

    public async Task<IQueryable<Order>> AddAccessFilterAsync(
        IQueryable<Order> query,
        CancellationToken cancellationToken = default)
    {
        var user = _httpContextAccessor.HttpContext.User;
        if (user.IsAnonymous())
        {
            throw new NotAccessibleException("Anonymous users are not permitted to list any orders.");
        }

        if (user.IsPowerAdmin())
        {
            return query;
        }

        var userId = user.GetUserId();
        if (!user.IsAdmin())
        {
            // non-admins can only read their own orders
            return query.Where(o => o.UserId == userId ||
                                    o.Registration.UserId == userId);
        }

        var org = await _currentOrganizationAccessorService
            .RequireCurrentOrganizationAsync(new OrganizationRetrievalOptions { LoadMembers = true },
                cancellationToken);

        if (!org.Members.Any(m => m.UserId == userId && m.HasRole(Roles.Admin)))
        {
            // not really an admin of the current org. return own orders only
            return query.Where(o => o.UserId == userId ||
                                    o.Registration.UserId == userId);
        }

        return query.Where(o => o.Registration.EventInfo.OrganizationId == org.OrganizationId);
    }

    private async Task<Registration> GetOrderRegistrationAsync(Order order, CancellationToken cancellationToken) =>
        order.Registration ??
        await _registrationRetrievalService
            .GetRegistrationByIdAsync(order.RegistrationId,
                cancellationToken: cancellationToken);
}
