using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IPaymentMethodService
	{
		Task<PaymentMethod> GetAsync(int id);
		Task<List<PaymentMethod>> GetActivePaymentMethodsAsync();
		int GetDefaultPaymentMethodId();
		Task<PaymentMethod> GetDefaultPaymentMethod();
	}
}
