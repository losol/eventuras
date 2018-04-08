using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class OrdersModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly IOrderService _orders;

        public OrdersModel(ApplicationDbContext context, IOrderService orders)
        {
            _context = context;
            _orders = orders;
        }

        public List<Order> Orders { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            // Get orders for
            Orders = await _orders.GetOrdersForEventAsync(id);

            return Page();
        }

        public async Task<IActionResult> OnPostEnsureOrdersAsync(int id)
        {

            // Get orders for
            var result = await _orders.EnsureOrdersForAllRegistrations(id);
            Orders = await _orders.GetOrdersForEventAsync(id);
            return Page();
        }
    }
}
