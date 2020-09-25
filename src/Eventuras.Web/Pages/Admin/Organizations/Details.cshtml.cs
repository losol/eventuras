using System;
using System.Collections.Generic;
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

        public IList<Organization> ParentOrganizations { get; set; }

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

            try
            {
                await _organizationManagementService.UpdateOrganizationAsync(Organization);
            }
            catch (DuplicateOrganizationHostnameException e)
            {
                ModelState.AddModelError($"{nameof(Organization)}.{nameof(Organization.EventurasHostname)}", e.Message);
                return await PageAsync(id);
            }

            return RedirectToPage("./Index");
        }

        private async Task<IActionResult> PageAsync(int id)
        {
            Organization = await _organizationRetrievalService.GetOrganizationByIdAsync(id);
            if (Organization == null)
            {
                return NotFound();
            }

            ParentOrganizations = (await _organizationRetrievalService.ListOrganizationsAsync(new OrganizationFilter
            {
                ParentOnly = true
            })).Where(o => o.OrganizationId != id).ToList();

            return Page();
        }
    }
}
