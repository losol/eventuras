using Eventuras.WebApi.Models;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationsQueryDto : PageQueryDto
    {
        public bool IncludeEventInfo { get; set; }

        public bool IncludeUserInfo { get; set; }
    }
}
