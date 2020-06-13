using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Web.Controllers.Api.V1
{
    [ApiVersion("1")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("api/v1/registrations/export")]
    [ApiController]
    public class RegistrationExportController : Controller
    {
        private readonly IRegistrationExportService _registrationExportService;

        public RegistrationExportController(IRegistrationExportService registrationExportService)
        {
            _registrationExportService = registrationExportService;
        }

        [HttpGet]
        public async Task<IActionResult> ExportAllRegistrations([FromQuery] RegistrationExportRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var stream = new MemoryStream();
            await _registrationExportService.ExportParticipantListToExcelAsync(stream, new IRegistrationExportService.Options
            {
                ExportHeader = request.Header
            });
            return new FileContentResult(stream.GetBuffer(), MimeType)
            {
                FileDownloadName = FileDownloadName
            };
        }

        [HttpGet("{eventId}")]
        public async Task<IActionResult> ExportAllRegistrationsForEvent([FromRoute] int eventId, [FromQuery] RegistrationExportRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var stream = new MemoryStream();
            await _registrationExportService.ExportParticipantListToExcelAsync(stream, new IRegistrationExportService.Options
            {
                EventInfoId = eventId,
                ExportHeader = request.Header
            });
            return new FileContentResult(stream.GetBuffer(), MimeType)
            {
                FileDownloadName = FileDownloadName
            };
        }

        private const string MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        private const string FileDownloadName = "registrations.xlsx";
    }

    public class RegistrationExportRequest
    {
        [FromQuery(Name = "header")]
        public bool Header { get; set; }
    }
}
