using Eventuras.Domain;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Eventuras.Web.Pages.Admin.Organizations
{
    public class CreateModel : PageModel
    {
        private readonly IOrganizationRetrievalService _organizationRetrievalService;
        private readonly IOrganizationManagementService _organizationManagementService;

        public CreateModel(
            IOrganizationRetrievalService organizationRetrievalService,
            IOrganizationManagementService organizationManagementService)
        {
            _organizationRetrievalService = organizationRetrievalService ?? throw new ArgumentNullException(nameof(organizationRetrievalService));
            _organizationManagementService = organizationManagementService ?? throw new ArgumentNullException(nameof(organizationManagementService));
        }

        public IList<Organization> ParentOrganizations { get; set; }

        public async Task<IActionResult> OnGet()
        {
            return await PageAsync();
        }

        [BindProperty]
        public Organization Organization { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return await PageAsync();
            }

            try
            {
                await _organizationManagementService.CreateNewOrganizationAsync(Organization);
            }
            catch (DuplicateOrganizationHostnameException e)
            {
                ModelState.AddModelError($"{nameof(Organization)}.{nameof(Organization.EventurasHostname)}", e.Message);
                return await PageAsync();
            }

            return RedirectToPage("./Index");
        }

        private async Task<IActionResult> PageAsync()
        {
            ParentOrganizations = await _organizationRetrievalService.ListOrganizationsAsync(new OrganizationFilter
            {
                ParentOnly = true
            });

            return Page();
        }
    }
}