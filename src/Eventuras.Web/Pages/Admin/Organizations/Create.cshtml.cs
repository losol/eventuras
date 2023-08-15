using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Web.Pages.Admin.Organizations;

public class CreateModel : PageModel
{
    private readonly IOrganizationManagementService _organizationManagementService;

    public CreateModel(IOrganizationManagementService organizationManagementService)
    {
        _organizationManagementService = organizationManagementService ?? throw new ArgumentNullException(nameof(organizationManagementService));
    }

    public IActionResult OnGet() => Page();

    [BindProperty]
    public Organization Organization { get; set; }

    [BindProperty]
    public string Hostnames { get; set; }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        await _organizationManagementService.CreateNewOrganizationAsync(Organization);

        if (!string.IsNullOrWhiteSpace(Hostnames))
            try { await _organizationManagementService.UpdateOrganizationHostnames(Organization.OrganizationId, Hostnames.Split(",")); }
            catch (DuplicateException e)
            {
                ModelState.AddModelError(nameof(Hostnames), e.Message);
                return Page();
            }

        return RedirectToPage("./Index");
    }
}