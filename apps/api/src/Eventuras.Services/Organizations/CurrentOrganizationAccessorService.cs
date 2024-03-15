using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Constants;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;


namespace Eventuras.Services.Organizations;

internal class CurrentOrganizationAccessorService : ICurrentOrganizationAccessorService
{
    private const string OrgIdParamName = "orgId";

    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentOrganizationAccessorService(
        ApplicationDbContext context,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public async Task<Organization> GetCurrentOrganizationAsync(
        OrganizationRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        // Check header first
        if (_httpContextAccessor.HttpContext.Request.Headers.TryGetValue(Api.OrganizationHeader, out var orgIdHeaderValue)
            && int.TryParse(orgIdHeaderValue, out var headerOrganizationId))
        {
            return await GetOrganizationById(headerOrganizationId, options, cancellationToken);
        }

        // Then check organization by orgId query param
        var orgIdParamValue = _httpContextAccessor.HttpContext.Request.Query[OrgIdParamName];
        if (!string.IsNullOrEmpty(orgIdParamValue) && int.TryParse(orgIdParamValue, out var organizationId))
        {
            return await GetOrganizationById(organizationId, options, cancellationToken);
        }

        // Try hostname approach, if no orgId is present in header or query
        var host = _httpContextAccessor.HttpContext.Request.Host;
        if (!host.HasValue)
        {
            return null;
        }

        return await _context.Organizations
            .AsNoTracking()
            .WithOptions(options ?? new OrganizationRetrievalOptions())
            .Where(o => o.Hostnames.Any(h => h.Active && h.Hostname == host.Value))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<Organization> GetOrganizationById(
        int organizationId,
        OrganizationRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        return await _context.Organizations
            .AsNoTracking()
            .WithOptions(options ?? new OrganizationRetrievalOptions())
            .Where(o => o.OrganizationId == organizationId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Organization> RequireCurrentOrganizationAsync(
        OrganizationRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        return await GetCurrentOrganizationAsync(options, cancellationToken) ??
               throw new OrgNotSpecifiedException(_httpContextAccessor.HttpContext.Request.Host.Value);
    }
}
