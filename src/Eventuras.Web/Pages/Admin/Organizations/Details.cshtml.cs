using System;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Web.Pages.Admin.Organizations
{
    public class DetailsModel : PageModel
    {
        private readonly IOrganizationRetrievalService _organizationRetrievalService;
        private readonly IOrganizationManagementService _organizationManagementService;

        public DetailsModel(
            IOrganizationRetrievalService organizationRetrievalService,
            IOrganizationManagementService organizationManagementService)
        {
            _organizationRetrievalService = organizationRetrievalService ?? throw new ArgumentNullException(nameof(organizationRetrievalService));
            _organizationManagementService = organizationManagementService ?? throw new ArgumentNullException(nameof(organizationManagementService));
        }

        [BindProperty]
        public Organization Organization { get; set; }

        [BindProperty]
        [DisplayName("Kommaseparerte Eventuras vertsnavn")]
        public string Hostnames { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            return await PageAsync(id);
        }

        public async Task<IActionResult> OnPostAsync(int id)
        {
            if (!ModelState.IsValid)
            {
                return await PageAsync(id);
            }

            await _organizationManagementService.UpdateOrganizationAsync(Organization);

            try
            {
                await _organizationManagementService.UpdateOrganizationHostnames(id, Hostnames.Split(','));
            }
            catch (DuplicateOrganizationHostnameException e)
            {
                ModelState.AddModelError(nameof(Hostnames), e.Message);
                return await PageAsync(id);
            }

            return RedirectToPage("./Index");
        }

        private async Task<IActionResult> PageAsync(int id)
        {
            var org = await _organizationRetrievalService.GetOrganizationByIdAsync(id, new OrganizationRetrievalOptions
            {
                LoadHostnames = true
            });

            Organization ??= org;

            if (Organization == null)
            {
                return NotFound();
            }

            Hostnames ??= org.CommaSeparatedHostnames;

            return Page();
        }
    }
}
