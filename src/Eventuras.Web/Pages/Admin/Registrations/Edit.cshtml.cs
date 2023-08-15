using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.Services.Events;
using Eventuras.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Pages.Admin.Registrations;

public class EditModel : PageModel
{
    private readonly ApplicationDbContext _context;
    private readonly IPaymentMethodService _paymentMethods;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly IUserRetrievalService _userListingService;

    public EditModel(
        ApplicationDbContext context,
        IPaymentMethodService paymentMethods,
        IEventInfoRetrievalService eventInfoRetrievalService,
        IUserRetrievalService userListingService)
    {
        _context = context;
        _paymentMethods = paymentMethods;
        _eventInfoRetrievalService = eventInfoRetrievalService;
        _userListingService = userListingService;
    }

    [BindProperty]
    public Registration Registration { get; set; }

    public async Task<IActionResult> OnGetAsync(int? id)
    {
        if (id == null) return NotFound();

        Registration = await _context.Registrations.Include(r => r.EventInfo).Include(r => r.User).SingleOrDefaultAsync(m => m.RegistrationId == id);

        if (Registration == null) return NotFound();

        ViewData["EventInfoId"] = new SelectList(await _eventInfoRetrievalService.GetAllEventsAsync(), "EventInfoId", "Slug");
        ViewData["PaymentMethod"] = new SelectList(await _paymentMethods.GetActivePaymentMethodsAsync(), "Provider", "Name");
        ViewData["UserId"] = new SelectList(await _userListingService.ListUsersAsync(), "Id", "Id");
        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        _context.Attach(Registration).State = EntityState.Modified;

        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!RegistrationExists(Registration.RegistrationId)) return NotFound();

            throw;
        }

        return RedirectToPage("./Index");
    }

    private bool RegistrationExists(int id)
    {
        return _context.Registrations.Any(e => e.RegistrationId == id);
    }
}