using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Web.Pages.Admin.Organizations;

public class DeleteModel : PageModel
{
    private readonly IOrganizationRetrievalService _organizationRetrievalService;
    private readonly IOrganizationManagementService _organizationManagementService;

    public DeleteModel(IOrganizationRetrievalService organizationRetrievalService, IOrganizationManagementService organizationManagementService)
    {
        _organizationRetrievalService = organizationRetrievalService ?? throw new ArgumentNullException(nameof(organizationRetrievalService));
        _organizationManagementService = organizationManagementService ?? throw new ArgumentNullException(nameof(organizationManagementService));
    }

    public Organization Organization { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Organization = await _organizationRetrievalService.GetOrganizationByIdAsync(id,
            new OrganizationRetrievalOptions
            {
                LoadHostnames = true,
            });
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(int id)
    {
        await _organizationManagementService.DeleteOrganizationAsync(id);
        return RedirectToPage("./Index");
    }
}