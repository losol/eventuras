using losol.EventManagement.Services.Registrations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.IO;
using System.Net.Mime;
using System.Threading.Tasks;

namespace losol.EventManagement.Web.Pages.Admin.Registrations
{
    public class ExportModel : PageModel
    {
        private readonly IRegistrationExportService _registrationExportService;

        public ExportModel(IRegistrationExportService registrationExportService)
        {
            _registrationExportService = registrationExportService ?? throw new ArgumentNullException(nameof(registrationExportService));
        }

        public async Task<IActionResult> OnGet()
        {
            var stream = new MemoryStream();
            await _registrationExportService.ExportParticipantListToExcelAsync(stream, new IRegistrationExportService.Options
            {
                ExportHeader = true
            });
            var cd = new ContentDisposition
            {
                FileName = $"registrations-{DateTime.Now:yyyy-MM-dd-HH-mm-ss-fff}.xlsx",
                Inline = false,
            };
            stream.Seek(0, SeekOrigin.Begin);
            Response.Headers.Add("Content-Disposition", cd.ToString());
            Response.Headers.ContentLength = stream.Length;
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }
    }
}