using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Pages.Admin.Temp.ProductVariants;

public class EditModel : PageModel
{
    private readonly ApplicationDbContext _context;

    public EditModel(ApplicationDbContext context)
    {
        _context = context;
    }

    [BindProperty]
    public ProductVariant ProductVariant { get; set; }

    public async Task<IActionResult> OnGetAsync(int? id)
    {
        if (id == null) return NotFound();

        ProductVariant = await _context.ProductVariants.Include(p => p.Product).SingleOrDefaultAsync(m => m.ProductVariantId == id);

        if (ProductVariant == null) return NotFound();

        ViewData["ProductId"] = new SelectList(_context.Products, "ProductId", "Name");
        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        _context.Attach(ProductVariant).State = EntityState.Modified;

        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProductVariantExists(ProductVariant.ProductVariantId)) return NotFound();

            throw;
        }

        return RedirectToPage("./Index");
    }

    private bool ProductVariantExists(int id)
    {
        return _context.ProductVariants.Any(e => e.ProductVariantId == id);
    }
}