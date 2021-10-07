using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
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
        private readonly IOrganizationRetrievalService _organizationRetrievalService;
        private readonly IOrganizationAccessControlService _organizationAccessControlService;

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

            var values = settings.ToDictionary(
                s => s.Name,
                s => s.Value);

            return _organizationSettingsRegistry.GetEntries()
                .OrderBy(e => e.Section)
                .ThenBy(e => e.Name)
                .Select(e => new OrganizationSettingDto(e)
                {
                    Value = values.ContainsKey(e.Name) ? values[e.Name] : null
                }).ToArray();
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
                .ToDictionary(s => s.Name, s => s);

            var entry = _organizationSettingsRegistry.GetEntries()
                .FirstOrDefault(e => e.Name == dto.Name);

            if (entry == null)
            {
                throw new NotFoundException($"Setting name {dto.Name} doesn't exist");
            }

            if (string.IsNullOrWhiteSpace(dto.Value))
            {
                if (settings.ContainsKey(dto.Name))
                {
                    await _organizationSettingsManagementService.RemoveOrganizationSettingAsync(settings[dto.Name]);
                }

                return Ok(new OrganizationSettingDto(entry)
                {
                    Value = null
                });
            }

            if (settings.ContainsKey(dto.Name))
            {
                var setting = settings[dto.Name];
                setting.Value = dto.Value;
                await _organizationSettingsManagementService.UpdateOrganizationSettingAsync(setting);
            }
            else
            {
                await _organizationSettingsManagementService
                    .CreateOrganizationSettingAsync(new OrganizationSetting
                    {
                        OrganizationId = organizationId,
                        Name = dto.Name,
                        Value = dto.Value
                    });
            }

            return Ok(new OrganizationSettingDto(entry)
            {
                Value = dto.Value
            });
        }
    }

    public class OrganizationSettingDto
    {
        public string Name { get; }

        public string Section { get; }

        public string Description { get; }

        public OrganizationSettingType Type { get; }

        public string Value { get; set; }

        public OrganizationSettingDto(OrganizationSettingEntry entry)
        {
            Name = entry.Name;
            Section = entry.Section;
            Description = entry.Description;
            Type = entry.Type;
        }
    }
}
