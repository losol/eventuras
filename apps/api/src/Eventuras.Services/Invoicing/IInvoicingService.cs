using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Invoicing;

public interface IInvoicingService
{
    /// <summary>
    ///     Creates new invoice from the given order array.
    ///     Allows to explicitly specify invoice information via the <c>info</c> param.
    ///     If no info is specified, it will be generated from the given <c>orders</c> automatically.
    /// </summary>
    /// <param name="orders">Array of orders (not empty).</param>
    /// <param name="info">Optional explicitly specified invoice info.</param>
    /// <exception cref="InvoicingException">Failed to create invoice.</exception>
    Task<Invoice> CreateInvoiceAsync(Order[] orders, InvoiceInfo info = null);

    /// <summary>
    ///     Gets invoice by its id.
    /// </summary>
    /// <param name="invoiceId">Invoice id.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <exception cref="InvoicingException">Failed to get invoice.</exception>
    /// <returns>Invoice with the given id.</returns>
    Task<Invoice> GetInvoiceByIdAsync(int invoiceId, CancellationToken cancellationToken = default);
}
