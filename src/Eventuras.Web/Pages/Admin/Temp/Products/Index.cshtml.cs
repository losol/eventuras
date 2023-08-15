using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Pages.Admin.Temp.Products;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _context;

    public IndexModel(ApplicationDbContext context)
    {
        _context = context;
    }

    public IList<Product> Product { get; set; }

    public async Task OnGetAsync()
    {
        Product = await _context.Products.Include(p => p.EventInfo).ToListAsync();
    }
}