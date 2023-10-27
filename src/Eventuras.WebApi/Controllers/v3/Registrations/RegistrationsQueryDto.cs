#nullable enable

using Eventuras.WebApi.Models;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationsQueryDto : PageQueryDto
    {
        [Range(1, int.MaxValue)]
        public int? EventId { get; set; }

        public string? UserId { get; set; }

        public bool IncludeEventInfo { get; set; }

        public bool IncludeUserInfo { get; set; }

        public bool IncludeProducts { get; set; }

        public bool IncludeOrders { get; set; }
    }
}