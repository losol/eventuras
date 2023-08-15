using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Pages.Admin.Registrations;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _context;

    public IndexModel(ApplicationDbContext context)
    {
        _context = context;
    }

    public IList<Registration> Registrations { get; set; }

    public async Task OnGetAsync()
    {
        Registrations = await _context.Registrations.Include(r => r.EventInfo).Include(r => r.User).ToListAsync();
    }
}