using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using losol.EventManagement.Data;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Pages.Admin.Temp.Products
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
        ViewData["EventInfoId"] = new SelectList(_context.EventInfos, "EventInfoId", "Code");
            return Page();
        }

        [BindProperty]
        public Product Product { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Products.Add(Product);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}