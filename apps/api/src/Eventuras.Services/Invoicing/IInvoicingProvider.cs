using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Invoicing
{
    public interface IInvoicingProvider
    {
        bool AcceptPaymentProvider(PaymentMethod.PaymentProvider provider);

        /// <exception cref="InvoicingException">Something gone wrong.</exception>
        /// <returns>New external invoice.</returns>
        Task<InvoiceResult> CreateInvoiceAsync(InvoiceInfo info);
    }
}
