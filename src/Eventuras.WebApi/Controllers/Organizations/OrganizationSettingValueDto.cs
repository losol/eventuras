using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Organizations
{
    [OrganizationSettingValue]
    public class OrganizationSettingValueDto
    {
        [Required] public string Name { get; set; }

        public string Value { get; set; }
    }
}
