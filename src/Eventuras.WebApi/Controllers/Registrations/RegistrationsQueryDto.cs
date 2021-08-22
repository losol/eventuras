using System.ComponentModel.DataAnnotations;
using Eventuras.WebApi.Models;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationsQueryDto : PageQueryDto
    {
        [Range(1, int.MaxValue)]
        public int? EventId { get; set; }

        public bool IncludeEventInfo { get; set; }

        public bool IncludeUserInfo { get; set; }
    }
}
