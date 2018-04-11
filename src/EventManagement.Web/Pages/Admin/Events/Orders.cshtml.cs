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
        private readonly IRegistrationService _registrations;

        public OrdersModel(IOrderService orders, IEventInfoService eventInfos, IRegistrationService registrations)
        {
            _eventInfos = eventInfos;
            _orders = orders;
            _registrations = registrations;
        }

        public List<Order> Orders { get; set; }
        public EventInfo EventInfo { get; set; }
        public List<Registration> Registrations{ get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            // Get orders for
            Orders = await _orders.GetOrdersForEventAsync(id);
            EventInfo = await _eventInfos.GetAsync(id);
            Registrations = await _registrations.GetRegistrationsWithOrders(id);
            Registrations.OrderBy (m => m.ParticipantName);
            return Page();
        }
    }
}
