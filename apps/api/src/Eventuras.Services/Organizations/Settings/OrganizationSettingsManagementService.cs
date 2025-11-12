using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Organizations.Settings;

public class OrganizationSettingsManagementService : IOrganizationSettingsManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly IOrganizationAccessControlService _organizationAccessControlService;
    private readonly IOrganizationSettingsCache _organizationSettingsCache;

    public OrganizationSettingsManagementService(
        ApplicationDbContext context,
        IOrganizationSettingsCache organizationSettingsCache,
        IOrganizationAccessControlService organizationAccessControlService)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _organizationSettingsCache = organizationSettingsCache ?? throw
            new ArgumentNullException(nameof(organizationSettingsCache));

        _organizationAccessControlService = organizationAccessControlService ?? throw
            new ArgumentNullException(nameof(organizationAccessControlService));
    }

    public async Task CreateOrganizationSettingAsync(
        OrganizationSetting setting,
        CancellationToken cancellationToken = default)
    {
        if (setting == null)
        {
            throw new ArgumentNullException(nameof(setting));
        }

        await _organizationAccessControlService.CheckOrganizationUpdateAccessAsync(setting.OrganizationId);

        if (await _context.OrganizationSettings
                .AnyAsync(s => s.OrganizationId == setting.OrganizationId &&
                               s.Name == setting.Name, cancellationToken))
        {
            throw new DuplicateException(
                $"Setting {setting.Name} already exists for organization {setting.OrganizationId}");
        }

        try
        {
            await _context.OrganizationSettings.AddAsync(setting, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            _organizationSettingsCache.InvalidateCacheForOrganization(setting.OrganizationId);
        }
        catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
        {
            _context.OrganizationSettings.Remove(setting);
            throw new DuplicateException(
                $"Setting {setting.Name} already exists for organization {setting.OrganizationId}", e);
        }
    }

    public async Task UpdateOrganizationSettingAsync(
        OrganizationSetting setting,
        CancellationToken cancellationToken = default)
    {
        if (setting == null)
        {
            throw new ArgumentNullException(nameof(setting));
        }

        try
        {
            await _organizationAccessControlService.CheckOrganizationUpdateAccessAsync(setting.OrganizationId);
            await _context.UpdateAsync(setting, cancellationToken);
            _organizationSettingsCache.InvalidateCacheForOrganization(setting.OrganizationId);
        }
        catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
        {
            _context.DisableChangeTracking(setting);
            throw new DuplicateException(
                $"Setting {setting.Name} already exists for organization {setting.OrganizationId}", e);
        }
    }

    public async Task RemoveOrganizationSettingAsync(
        OrganizationSetting setting,
        CancellationToken cancellationToken = default)
    {
        if (setting == null)
        {
            throw new ArgumentNullException(nameof(setting));
        }

        await _organizationAccessControlService.CheckOrganizationUpdateAccessAsync(setting.OrganizationId);
        await _context.DeleteAsync(setting, cancellationToken);
        _organizationSettingsCache.InvalidateCacheForOrganization(setting.OrganizationId);
    }
}
