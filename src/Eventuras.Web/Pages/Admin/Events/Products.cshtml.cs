using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Pages.Admin.Events
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

            // Set the order of the products correctly
            if (Vm.Products.Any())
            {
                for (int i = 0; i < Vm.Products.Count; i++)
                {
                    Vm.Products[i].DisplayOrder = i;
                }
            }

            await _eventsService.UpdateEventProductsAsync(Vm.EventInfoId, Vm.Products);
            return RedirectToPage("./Details", new { id = Vm.EventInfoId });
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
