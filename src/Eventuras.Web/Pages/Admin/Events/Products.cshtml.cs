using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Pages.Admin.Events;

public class EventProductsModel : PageModel
{
    [BindProperty]
    public EventProductsModelVM Vm { get; set; }

    public EventInfo EventInfo { get; set; }

    private readonly IEventInfoRetrievalService _eventsService;
    private readonly IEventManagementService _eventManagementService;
    private readonly IEventProductsManagementService _eventProductsManagementService;

    public EventProductsModel(
        IEventInfoRetrievalService eventsService,
        IEventManagementService eventManagementService,
        IEventProductsManagementService eventProductsManagementService)
    {
        _eventsService = eventsService;
        _eventManagementService = eventManagementService;
        _eventProductsManagementService = eventProductsManagementService;
    }

    public async Task<IActionResult> OnGet(int id)
    {
        if (id is 0) return BadRequest();

        EventInfo = await _eventsService.GetEventInfoByIdAsync(id,
            new EventInfoRetrievalOptions
            {
                LoadProducts = true,
            });
        if (EventInfo is null) return NotFound();

        Vm = new EventProductsModelVM
        {
            EventInfoId = EventInfo.EventInfoId,
            Products = EventInfo.Products,
        };
        return Page();
    }

    public async Task<IActionResult> OnPost()
    {
        if (!ModelState.IsValid) return BadRequest();

        // Set the order of the products correctly
        if (Vm.Products.Any())
            for (var i = 0; i < Vm.Products.Count; i++)
                Vm.Products[i].DisplayOrder = i;

        await _eventProductsManagementService.UpdateEventProductsAsync(Vm.EventInfoId, Vm.Products);
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