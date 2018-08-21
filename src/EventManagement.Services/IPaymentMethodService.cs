using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using static losol.EventManagement.Domain.PaymentMethod;

namespace losol.EventManagement.Services
{
	public interface IPaymentMethodService
	{
		PaymentMethod Get(int id);
        PaymentMethod Get(PaymentProvider provider);
		List<PaymentMethod> GetActivePaymentMethods();
		PaymentMethod GetDefaultPaymentMethod();
	}
}
