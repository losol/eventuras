using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Eventuras.Infrastructure;

namespace Eventuras.Pages.Admin.Temp.ProductVariants
{
    public class DetailsModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public DetailsModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public ProductVariant ProductVariant { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ProductVariant = await _context.ProductVariants
                .Include(p => p.Product).SingleOrDefaultAsync(m => m.ProductVariantId == id);

            if (ProductVariant == null)
            {
                return NotFound();
            }
            return Page();
        }
    }
}
