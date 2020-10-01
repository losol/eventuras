using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Events;
using Eventuras.Services.Orders;

namespace Eventuras.Pages.Admin.Events
{
    public class OrdersModel : PageModel
    {
        private readonly IOrderService _orders;
        private readonly IEventInfoRetrievalService _eventInfos;
        private readonly IRegistrationService _registrations;

        public OrdersModel(IOrderService orders, IEventInfoRetrievalService eventInfos, IRegistrationService registrations)
        {
            _eventInfos = eventInfos;
            _orders = orders;
            _registrations = registrations;
        }

        public List<Order> Orders { get; set; }
        public EventInfo EventInfo { get; set; }
        public List<Product> Products => EventInfo?.Products;
        public List<Registration> Registrations { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            // Get orders for
            Orders = await _orders.GetOrdersForEventAsync(id);
            EventInfo = await _eventInfos.GetEventInfoByIdAsync(id, new EventInfoRetrievalOptions
            {
                LoadProducts = true
            });
            Registrations = await _registrations.GetRegistrationsWithOrders(id);
            Registrations.OrderBy(m => m.ParticipantName);
            return Page();
        }

        public async Task<IActionResult> OnGetOrdersAsync(int? id)
        {
            if (id == null) return NotFound();

            var orders = (await _registrations.GetAsync(id.Value))
                .Orders
                .SelectMany(o => o.OrderLines)
                .Select(ol => ol.OrderLineId);
            return new JsonResult(orders);
        }

        public string GetOrderButtonText(Registration registration)
        {
            if (!registration.Orders.Any(o => o.Status != Order.OrderStatus.Invoiced))
            {
                return "New Order";
            }
            return "Update Order";
        }
    }
}
