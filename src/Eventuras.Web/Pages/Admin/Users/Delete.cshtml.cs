using System.Threading.Tasks;
using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Pages.Admin.Users;

public class DeleteModel : PageModel
{
    private readonly UserManager<ApplicationUser> _userManager;

    public DeleteModel(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [BindProperty]
    public ApplicationUser ApplicationUser { get; set; }

    public async Task<IActionResult> OnGetAsync(string id)
    {
        if (id == null) return NotFound();

        ApplicationUser = await _userManager.FindByIdAsync(id);
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(string id)
    {
        if (id == null) return NotFound();

        ApplicationUser = await _userManager.FindByIdAsync(id);

        if (ApplicationUser != null)
        {
            ApplicationUser.Archived = true;
            await _userManager.UpdateAsync(ApplicationUser);
        }

        return RedirectToPage("./Index");
    }
}