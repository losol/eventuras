using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using static losol.EventManagement.Domain.PaymentMethod;

namespace losol.EventManagement.Services
{
	public class PaymentMethodService : IPaymentMethodService
	{
        private readonly IEnumerable<PaymentMethod> paymentMethods;

		public PaymentMethodService(IOptions<List<PaymentMethod>> paymentMethodConfig)
		{
            paymentMethods = paymentMethodConfig.Value;
		}

		public List<PaymentMethod> GetActivePaymentMethods()
		{
			return paymentMethods.Where(p => p.Active).ToList();
		}

		public PaymentMethod Get(int id)
		{
			return paymentMethods.SingleOrDefault(p => p.PaymentMethodId == id);
		}

        public PaymentMethod Get(PaymentProvider provider)
		{
			return paymentMethods.SingleOrDefault(p => p.Provider == provider);
		}

		public PaymentMethod GetDefaultPaymentMethod()
		{
			return paymentMethods.Single(p => p.IsDefault);
		}
	}
}
