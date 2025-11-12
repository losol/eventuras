using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Eventuras.Services.Organizations.Settings;

public class OrganizationSettingsCache : IOrganizationSettingsCache
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _memoryCache;

    public OrganizationSettingsCache(IMemoryCache memoryCache, ApplicationDbContext context)
    {
        _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<OrganizationSetting[]> GetAllSettingsForOrganizationAsync(int organizationId) =>
        await _memoryCache.GetOrCreateAsync(KeyForOrg(organizationId), async _ =>
        {
            return await _context.OrganizationSettings
                .AsNoTracking()
                .Where(s => s.OrganizationId == organizationId)
                .ToArrayAsync();
        });

    public void InvalidateCacheForOrganization(int organizationId) => _memoryCache.Remove(KeyForOrg(organizationId));

    private static string KeyForOrg(int organizationId) => $"org-settings-{organizationId}";
}
