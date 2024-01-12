using Asp.Versioning;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.v3.Products
{
    [ApiVersion("3")]
    [Authorize]
    [Route("v{version:apiVersion}/products")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRetrievalService _productRetrievalService;
        private readonly IOrderRetrievalService _orderRetrievalService;

        public ProductsController(
            IProductRetrievalService productRetrievalService,
            IOrderRetrievalService orderRetrievalService
            )
        {
            _productRetrievalService = productRetrievalService;
            _orderRetrievalService = orderRetrievalService;
        }


        [HttpGet("{productId:int}/summary")]
        public async Task<ActionResult<ProductDeliverySummaryDto>> GetProductDeliverySummary(int productId, CancellationToken cancellationToken = default)
        {
            var product = await _productRetrievalService.GetProductByIdAsync(productId);
            var productDto = ProductSummaryDto.FromProduct(product);

            var orderSummaries = await _orderRetrievalService.GetProductOrdersSummaryAsync(productId, cancellationToken);

            var productDeliverySummaryDto = new ProductDeliverySummaryDto
            {
                Product = productDto,
                OrderSummary = orderSummaries
            };

            return Ok(productDeliverySummaryDto);
        }


    }
}