using losol.EventManagement.Domain;
using Xunit;

namespace losol.EventManagement.UnitTests
{
    public class OrderLineTests
    {
        public class CreateRefundOrderLine_Should
        {
            [Fact]
            public void ReturnAnOrderLine() // Give this a better name!
            {
                OrderLine line = new OrderLine
                {
                    ProductId = 1,
                    ProductVariantId = 1,
                    OrderId = 1,
                    Price = 100,
                    Quantity = 1
                };
                var refund = line.CreateRefundOrderLine();

                Assert.Equal(line.Price, refund.Price);
                Assert.Equal(-line.Quantity, refund.Quantity);
                Assert.Equal(-line.TotalAmount, refund.TotalAmount);
            }
        }
    }
}