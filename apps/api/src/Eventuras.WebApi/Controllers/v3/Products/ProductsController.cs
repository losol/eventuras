using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Products;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/products")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IOrderRetrievalService _orderRetrievalService;
    private readonly IProductRetrievalService _productRetrievalService;

    public ProductsController(
        IProductRetrievalService productRetrievalService,
        IOrderRetrievalService orderRetrievalService
    )
    {
        _productRetrievalService = productRetrievalService;
        _orderRetrievalService = orderRetrievalService;
    }


    [HttpGet("{productId:int}/summary")]
    [ProducesResponseType(typeof(ProductDeliverySummaryDto), 200)]
    public async Task<ActionResult<ProductDeliverySummaryDto>> GetProductDeliverySummary(int productId,
        CancellationToken cancellationToken = default)
    {
        // check that the product exists
        var product = await _productRetrievalService.GetProductByIdAsync(productId);
        if (product == null)
        {
            return NotFound();
        }

        var deliverySummary = await _orderRetrievalService.GetProductDeliverySummaryAsync(productId, cancellationToken);
        return Ok(deliverySummary);
    }
}
