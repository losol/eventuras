using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using static losol.EventManagement.Domain.PaymentMethod;

namespace losol.EventManagement.Services
{
	public interface IPaymentMethodService
	{
        Task<PaymentMethod> GetAsync(PaymentProvider provider);
		Task<List<PaymentMethod>> GetActivePaymentMethodsAsync();
		Task<PaymentMethod> GetDefaultPaymentMethodAsync();
        PaymentProvider GetDefaultPaymentProvider();
	}
}
