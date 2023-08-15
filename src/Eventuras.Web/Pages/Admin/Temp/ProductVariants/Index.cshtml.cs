using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Pages.Admin.Temp.ProductVariants;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _context;

    public IndexModel(ApplicationDbContext context)
    {
        _context = context;
    }

    public IList<ProductVariant> ProductVariant { get; set; }

    public async Task OnGetAsync()
    {
        ProductVariant = await _context.ProductVariants.Include(p => p.Product).ToListAsync();
    }
}