using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IPaymentMethodService
	{
		PaymentMethod Get(int id);
		List<PaymentMethod> GetActivePaymentMethods();
		int GetDefaultPaymentMethodId();
		PaymentMethod GetDefaultPaymentMethod();
	}
}
