using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Web.Pages.Admin.Users;

public class IndexModel : PageModel
{
    public IActionResult OnGet() => Page();
}