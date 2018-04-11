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
    public class AddRegistrationModel : PageModel
    {
        private readonly IEventInfoService _eventInfos;
        private readonly IRegistrationService _registrations;
        private readonly IOrderService _orders;
        private readonly IPaymentMethodService _paymentMethodService;

        public AddRegistrationModel(IOrderService orders, IEventInfoService eventInfos, IRegistrationService registrations, IPaymentMethodService paymentMethods)
        {
            _eventInfos = eventInfos;
            _orders = orders;
            _registrations = registrations;
            _paymentMethodService = paymentMethods;
        }

		[BindProperty]
		public Web.Pages.Register.RegisterVM Registration { get; set; } // TODO change this?

		public EventInfo EventInfo { get; set; }
		public List<PaymentMethod> PaymentMethods { get; set; }
		public List<Product> Products => EventInfo.Products;
		public int DefaultPaymentMethod => _paymentMethodService.GetDefaultPaymentMethodId();

        public async Task<IActionResult> OnGetAsync(int id)
        {
			EventInfo = await _eventInfos.GetWithProductsAsync(id);

			if (EventInfo == null)
			{
				return NotFound();
			}
            
            PaymentMethods = await _paymentMethodService.GetActivePaymentMethodsAsync();
			Registration = new Web.Pages.Register.RegisterVM(EventInfo, DefaultPaymentMethod);

            return Page();
        }
    }
}
