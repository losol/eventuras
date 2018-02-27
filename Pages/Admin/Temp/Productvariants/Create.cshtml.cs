using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using losol.EventManagement.Data;
using losol.EventManagement.Models;

namespace losol.EventManagement.Pages.Admin.Temp.Productvariants
{
    public class CreateModel : PageModel
    {
        private readonly losol.EventManagement.Data.ApplicationDbContext _context;

        public CreateModel(losol.EventManagement.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult OnGet()
        {
        ViewData["ProductId"] = new SelectList(_context.Product, "ProductId", "ProductId");
            return Page();
        }

        [BindProperty]
        public ProductVariant ProductVariant { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.ProductVariant.Add(ProductVariant);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}