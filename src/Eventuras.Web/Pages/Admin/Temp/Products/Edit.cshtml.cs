using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;

namespace Eventuras.Pages.Admin.Temp.Products
{
    public class EditModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;

        public EditModel(
            ApplicationDbContext context,
            IEventInfoRetrievalService eventInfoRetrievalService)
        {
            _context = context;
            _eventInfoRetrievalService = eventInfoRetrievalService;
        }

        [BindProperty]
        public Product Product { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Product = await _context.Products
                .Include(p => p.Eventinfo).SingleOrDefaultAsync(m => m.ProductId == id);

            if (Product == null)
            {
                return NotFound();
            }
            ViewData["EventInfoId"] = new SelectList(await _eventInfoRetrievalService.GetAllEventsAsync(), "EventInfoId", "Slug");
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(Product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(Product.ProductId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return RedirectToPage("./Index");
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.ProductId == id);
        }
    }
}
