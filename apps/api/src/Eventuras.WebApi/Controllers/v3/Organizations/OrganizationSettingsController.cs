using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Organizations.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Organizations;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/organizations/{organizationId:int}/settings")]
[ApiController]
public class OrganizationSettingsController : ControllerBase
{
    private readonly IOrganizationAccessControlService _organizationAccessControlService;
    private readonly IOrganizationRetrievalService _organizationRetrievalService;
    private readonly IOrganizationSettingsCache _organizationSettingsCache;
    private readonly IOrganizationSettingsManagementService _organizationSettingsManagementService;
    private readonly IOrganizationSettingsRegistry _organizationSettingsRegistry;

    public OrganizationSettingsController(
        IOrganizationSettingsCache organizationSettingsCache,
        IOrganizationSettingsManagementService organizationSettingsManagementService,
        IOrganizationSettingsRegistry organizationSettingsRegistry,
        IOrganizationRetrievalService organizationRetrievalService,
        IOrganizationAccessControlService organizationAccessControlService)
    {
        _organizationSettingsCache = organizationSettingsCache ?? throw
            new ArgumentNullException(nameof(organizationSettingsCache));

        _organizationSettingsManagementService = organizationSettingsManagementService ?? throw
            new ArgumentNullException(nameof(organizationSettingsManagementService));

        _organizationSettingsRegistry = organizationSettingsRegistry ?? throw
            new ArgumentNullException(nameof(organizationSettingsRegistry));

        _organizationRetrievalService = organizationRetrievalService ?? throw
            new ArgumentNullException(nameof(organizationRetrievalService));

        _organizationAccessControlService = organizationAccessControlService ?? throw
            new ArgumentNullException(nameof(organizationAccessControlService));
    }

    [HttpGet]
    public async Task<OrganizationSettingDto[]> List(int organizationId, CancellationToken cancellationToken)
    {
        await _organizationRetrievalService
            .GetOrganizationByIdAsync(organizationId,
                cancellationToken: cancellationToken); // to check for org existence

        var settings = await _organizationSettingsCache
            .GetAllSettingsForOrganizationAsync(organizationId);

        var stored = settings.ToDictionary(s => s.Name);

        return _organizationSettingsRegistry.GetEntries()
            .OrderBy(e => e.Section)
            .ThenBy(e => e.Name)
            .Select(e => new OrganizationSettingDto(e, stored.GetValueOrDefault(e.Name)))
            .ToArray();
    }

    [HttpPut]
    public async Task<IActionResult> Update(int organizationId, OrganizationSettingValueDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.FormatErrors());
        }

        await _organizationRetrievalService
            .GetOrganizationByIdAsync(organizationId); // to check for org existence

        await _organizationAccessControlService
            .CheckOrganizationUpdateAccessAsync(organizationId);

        var settings = (await _organizationSettingsCache
                .GetAllSettingsForOrganizationAsync(organizationId))
            .ToDictionary(s => s.Name);

        var entry = _organizationSettingsRegistry.GetEntries()
            .FirstOrDefault(e => e.Name == dto.Name);

        if (entry == null)
        {
            throw new NotFoundException($"Setting name {dto.Name} doesn't exist");
        }

        var stored = await StoreValueAsync(organizationId, dto, settings.GetValueOrDefault(dto.Name));

        return Ok(new OrganizationSettingDto(entry, stored));
    }

    [HttpPost]
    public async Task<IActionResult> BatchUpdate(int organizationId,
        [Required][MinLength(1)] OrganizationSettingValueDto[] dtos)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.FormatErrors());
        }

        await _organizationRetrievalService
            .GetOrganizationByIdAsync(organizationId); // to check for org existence

        await _organizationAccessControlService
            .CheckOrganizationUpdateAccessAsync(organizationId);

        var settings = (await _organizationSettingsCache
                .GetAllSettingsForOrganizationAsync(organizationId))
            .ToDictionary(s => s.Name);

        var entries = _organizationSettingsRegistry.GetEntries()
            .ToDictionary(e => e.Name);

        // check all entries are registered
        var nonExistingEntries = dtos.Select(d => d.Name)
            .Where(name => !entries.ContainsKey(name))
            .ToArray();

        if (nonExistingEntries.Any())
        {
            var names = string.Join(", ", nonExistingEntries);
            throw new NotFoundException($"Settings {names} not registered in the system");
        }

        var result = new List<OrganizationSettingDto>();
        foreach (var dto in dtos)
        {
            var stored = await StoreValueAsync(organizationId, dto, settings.GetValueOrDefault(dto.Name));
            if (stored == null)
            {
                continue;
            }

            result.Add(new OrganizationSettingDto(entries[dto.Name], stored));
        }

        return Ok(result);
    }

    /// <summary>
    ///     Writes one value. A blank clears the stored value but keeps the row, so the
    ///     setting's uuid survives being set again. Returns the stored setting, or
    ///     <c>null</c> when a blank was written to a setting that was never set.
    /// </summary>
    private async Task<OrganizationSetting> StoreValueAsync(
        int organizationId,
        OrganizationSettingValueDto dto,
        OrganizationSetting existing)
    {
        var value = string.IsNullOrWhiteSpace(dto.Value) ? null : dto.Value;

        if (existing != null)
        {
            existing.Value = value;
            await _organizationSettingsManagementService.UpdateOrganizationSettingAsync(existing);
            return existing;
        }

        if (value == null)
        {
            return null;
        }

        var setting = new OrganizationSetting
        {
            OrganizationId = organizationId,
            Name = dto.Name,
            Value = value
        };

        await _organizationSettingsManagementService.CreateOrganizationSettingAsync(setting);
        return setting;
    }
}

public class OrganizationSettingDto
{
    public OrganizationSettingDto(OrganizationSettingEntry entry, OrganizationSetting setting = null)
    {
        Name = entry.Name;
        Section = entry.Section;
        Description = entry.Description;
        Type = entry.Type;
        Sensitivity = entry.Sensitivity;
        Uuid = setting?.Uuid;
        // Whitespace is what a write treats as clearing, so it does not count as set.
        IsSet = !string.IsNullOrWhiteSpace(setting?.Value);

        // A secret is write-only: callers learn whether it is set, never what it is.
        Value = entry.Sensitivity == OrganizationSettingSensitivity.Secret ? null : setting?.Value;
    }

    /// <summary>Identity of the stored setting, null until it has been set once.</summary>
    public Guid? Uuid { get; }

    public string Name { get; }

    public string Section { get; }

    public string Description { get; }

    public OrganizationSettingType Type { get; }

    public OrganizationSettingSensitivity Sensitivity { get; }

    /// <summary>Whether a value is stored, which is all a secret ever reports.</summary>
    public bool IsSet { get; }

    public string Value { get; }
}
