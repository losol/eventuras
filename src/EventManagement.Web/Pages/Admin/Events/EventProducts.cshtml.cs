using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class EventProductsModel : PageModel
    {
        [BindProperty] public EventProductsModelVM Vm { get; set; }
        public EventInfo EventInfo { get; set; }
        private readonly IEventInfoService _eventsService;

        public EventProductsModel(IEventInfoService eventsService)
        {
            _eventsService = eventsService;
        }

        public async Task<IActionResult> OnGet(int id)
        {
            if (id is 0) return BadRequest();
            EventInfo = await _eventsService.GetWithProductsAsync(id);
            if (EventInfo is null) return NotFound();
            Vm = new EventProductsModelVM
            {
                EventInfoId = EventInfo.EventInfoId,
                Products = EventInfo.Products
            };
            return Page();
        }

        public async Task<IActionResult> OnPost()
        {
            if (!ModelState.IsValid) return BadRequest();
            await _eventsService.UpdateEventProductsAsync(Vm.EventInfoId, Vm.Products);
            return RedirectToPage();
        }
    }

    public class EventProductsModelVM
    {
        [Required]
        public int EventInfoId { get; set; }

        [Required]
        public List<Product> Products { get; set; }
    }
}
