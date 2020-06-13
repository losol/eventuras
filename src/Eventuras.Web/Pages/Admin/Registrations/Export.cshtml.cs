using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.IO;
using System.Net.Mime;
using System.Threading.Tasks;

namespace Eventuras.Web.Pages.Admin.Registrations
{
    public class ExportModel : PageModel
    {
        private readonly IRegistrationExportService _registrationExportService;

        public ExportModel(IRegistrationExportService registrationExportService)
        {
            _registrationExportService = registrationExportService ?? throw new ArgumentNullException(nameof(registrationExportService));
        }

        public async Task<IActionResult> OnGet(int? id)
        {
            var stream = new MemoryStream();
            await _registrationExportService.ExportParticipantListToExcelAsync(stream, new IRegistrationExportService.Options
            {
                ExportHeader = true,
                EventInfoId = id
            });
            var fileName = id.HasValue
                ? $"registrations-event{id:####}-{DateTime.Now:yyyy-MM-dd-HH-mm-ss-fff}.xlsx"
                : $"registrations-{DateTime.Now:yyyy-MM-dd-HH-mm-ss-fff}.xlsx";
            var cd = new ContentDisposition
            {
                FileName = fileName,
                Inline = false,
            };
            stream.Seek(0, SeekOrigin.Begin);
            Response.Headers.Add("Content-Disposition", cd.ToString());
            Response.Headers.ContentLength = stream.Length;
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }
    }
}