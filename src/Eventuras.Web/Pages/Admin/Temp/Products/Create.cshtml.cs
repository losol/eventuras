using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace Eventuras.Pages.Admin.Temp.Products;

public class CreateModel : PageModel
{
    private readonly ApplicationDbContext _context;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;

    public CreateModel(ApplicationDbContext context, IEventInfoRetrievalService eventInfoRetrievalService)
    {
        _context = context;
        _eventInfoRetrievalService = eventInfoRetrievalService;
    }

    public async Task<IActionResult> OnGet()
    {
        ViewData["EventInfoId"] = new SelectList(await _eventInfoRetrievalService.GetAllEventsAsync(), "EventInfoId", "Slug");
        return Page();
    }

    [BindProperty]
    public Product Product { get; set; }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        _context.Products.Add(Product);
        await _context.SaveChangesAsync();

        return RedirectToPage("./Index");
    }
}