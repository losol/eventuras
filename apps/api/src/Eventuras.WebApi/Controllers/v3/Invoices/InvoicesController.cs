using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Invoicing;
using Eventuras.Services.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.v3.Invoices;

[ApiVersion("3")]
[Authorize]
[Route("v{version:apiVersion}/invoices")]
[ApiController]
public class InvoicesController : ControllerBase
{
    private readonly IInvoicingService _invoicingService;
    private readonly ILogger<InvoicesController> _logger;
    private readonly IOrderRetrievalService _orderRetrievalService;

    public InvoicesController(
        IInvoicingService invoicingService,
        IOrderRetrievalService orderRetrievalService,
        ILogger<InvoicesController> logger)
    {
        _invoicingService = invoicingService;
        _orderRetrievalService = orderRetrievalService;
        _logger = logger;
    }

    [HttpGet("{id:int}")]
    public async Task<InvoiceDto> GetInvoiceById(int id, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoicingService.GetInvoiceByIdAsync(id, cancellationToken);

        return new InvoiceDto(invoice);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice([FromBody] InvoiceRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var orders =
                await _orderRetrievalService.GetOrdersPopulatedByRegistrationAsync(request.OrderIds, cancellationToken);

            _logger.LogInformation($"Creating invoice for orders {orders}");
            var invoiceInfo = InvoiceInfo.CreateFromOrderList(orders);
            _logger.LogInformation($"Invoice info {invoiceInfo}");

            var invoice = await _invoicingService.CreateInvoiceAsync(orders.ToArray(), invoiceInfo);

            return new InvoiceDto(invoice);
        }
        catch (InvoicingException ex)
        {
            _logger.LogWarning(ex, "Invoice creation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }
}
