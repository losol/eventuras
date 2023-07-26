using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Eventuras.Infrastructure;

namespace Eventuras.Pages.Admin.Temp.ProductVariants
{
    public class DeleteModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public DeleteModel(ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
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

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ProductVariant = await _context.ProductVariants.FindAsync(id);

            if (ProductVariant != null)
            {
                _context.ProductVariants.Remove(ProductVariant);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
