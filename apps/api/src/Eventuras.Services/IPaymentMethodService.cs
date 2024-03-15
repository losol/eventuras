using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services;

public interface IPaymentMethodService
{
    Task<PaymentMethod> GetAsync(PaymentProvider provider);
    Task<List<PaymentMethod>> GetActivePaymentMethodsAsync();
    Task<PaymentMethod> GetDefaultPaymentMethodAsync();
    PaymentProvider GetDefaultPaymentProvider();
}
