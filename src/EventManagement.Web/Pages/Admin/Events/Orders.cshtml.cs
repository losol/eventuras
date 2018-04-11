using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class OrdersModel : PageModel
    {
        private readonly IOrderService _orders;
        private readonly IEventInfoService _eventInfos;

        public OrdersModel(IOrderService orders, IEventInfoService eventInfos)
        {
            _eventInfos = eventInfos;
            _orders = orders;
        }

        public List<Order> Orders { get; set; }
        public EventInfo EventInfo { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            // Get orders for
            Orders = await _orders.GetOrdersForEventAsync(id);
            EventInfo = await _eventInfos.GetAsync(id);
            return Page();
        }

		// TODO: Remove this IF it is not being used anywhere
        public IActionResult OnPostEnsureOrdersAsync(int id)
        {

            // Get orders for
            // var result = await _orders.EnsureOrdersForAllRegistrations(id);

            return RedirectToPage("Orders");
        }
    }
}
