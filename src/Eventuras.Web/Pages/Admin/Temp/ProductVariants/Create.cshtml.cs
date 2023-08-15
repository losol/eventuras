using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace Eventuras.Pages.Admin.Temp.ProductVariants;

public class CreateModel : PageModel
{
    private readonly ApplicationDbContext _context;

    public CreateModel(ApplicationDbContext context)
    {
        _context = context;
    }

    public IActionResult OnGet()
    {
        ViewData["ProductId"] = new SelectList(_context.Products, "ProductId", "Name");
        return Page();
    }

    [BindProperty]
    public ProductVariant ProductVariant { get; set; }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        _context.ProductVariants.Add(ProductVariant);
        await _context.SaveChangesAsync();

        return RedirectToPage("./Index");
    }
}