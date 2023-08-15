using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Pages.Admin.Registrations;

public class DeleteModel : PageModel
{
    private readonly ApplicationDbContext _context;

    public DeleteModel(ApplicationDbContext context)
    {
        _context = context;
    }

    [BindProperty]
    public Registration Registration { get; set; }

    public async Task<IActionResult> OnGetAsync(int? id)
    {
        if (id == null) return NotFound();

        Registration = await _context.Registrations.Include(r => r.EventInfo).Include(r => r.User).SingleOrDefaultAsync(m => m.RegistrationId == id);

        if (Registration == null) return NotFound();

        return Page();
    }

    public async Task<IActionResult> OnPostAsync(int? id)
    {
        if (id == null) return NotFound();

        Registration = await _context.Registrations.FindAsync(id);

        if (Registration != null)
        {
            _context.Registrations.Remove(Registration);
            await _context.SaveChangesAsync();
        }

        return RedirectToPage("./Index");
    }
}