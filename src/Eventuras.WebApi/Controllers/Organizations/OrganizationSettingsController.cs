using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Organizations.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Organizations
{
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/organizations/{organizationId:int}/settings")]
    [ApiController]
    public class OrganizationSettingsController : ControllerBase
    {
        private readonly IOrganizationSettingsRegistry _organizationSettingsRegistry;
        private readonly IOrganizationSettingsCache _organizationSettingsCache;
        private readonly IOrganizationSettingsManagementService _organizationSettingsManagementService;

        public OrganizationSettingsController(
            IOrganizationSettingsCache organizationSettingsCache,
            IOrganizationSettingsManagementService organizationSettingsManagementService,
            IOrganizationSettingsRegistry organizationSettingsRegistry)
        {
            _organizationSettingsCache = organizationSettingsCache ?? throw
                new ArgumentNullException(nameof(organizationSettingsCache));

            _organizationSettingsManagementService = organizationSettingsManagementService ?? throw
                new ArgumentNullException(nameof(organizationSettingsManagementService));

            _organizationSettingsRegistry = organizationSettingsRegistry;
        }

        [HttpGet]
        public async Task<OrgSettingDto[]> List(int organizationId)
        {
            var settings = await _organizationSettingsCache
                .GetAllSettingsForOrganizationAsync(organizationId);

            var values = settings.ToDictionary(
                s => s.Name,
                s => s.Value);

            return _organizationSettingsRegistry.GetEntries()
                .OrderBy(e => e.Section)
                .ThenBy(e => e.Name)
                .Select(e => new OrgSettingDto(e)
                {
                    Value = values.ContainsKey(e.Name) ? values[e.Name] : null
                }).ToArray();
        }

        [HttpPut]
        public async Task<IActionResult> Update(int organizationId, OrgSettingValueDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var settings = (await _organizationSettingsCache
                    .GetAllSettingsForOrganizationAsync(organizationId))
                .ToDictionary(s => s.Name, s => s);

            if (settings.ContainsKey(dto.Name))
            {
                if (string.IsNullOrEmpty(dto.Value))
                {
                    await _organizationSettingsManagementService.RemoveOrganizationSettingAsync(settings[dto.Name]);
                    return Ok();
                }

                var setting = settings[dto.Name];
                setting.Value = dto.Value;
                await _organizationSettingsManagementService.UpdateOrganizationSettingAsync(setting);
            }
            else
            {
                if (!string.IsNullOrEmpty(dto.Value))
                {
                    await _organizationSettingsManagementService
                        .CreateOrganizationSettingAsync(new OrganizationSetting
                        {
                            OrganizationId = organizationId,
                            Name = dto.Name,
                            Value = dto.Value
                        });
                }
            }

            return Ok();
        }
    }

    public class OrgSettingDto
    {
        public string Name { get; }

        public string Section { get; }

        public string Description { get; }

        public OrganizationSettingType Type { get; }

        public string Value { get; set; }

        public OrgSettingDto(OrganizationSettingEntry entry)
        {
            Name = entry.Name;
            Section = entry.Section;
            Description = entry.Description;
            Type = entry.Type;
        }
    }

    public class OrgSettingValueDto
    {
        [Required] public string Name { get; set; }

        public string Value { get; set; }
    }
}
