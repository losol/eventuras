using System;
using Eventuras.Domain;
using Xunit;

namespace Eventuras.UnitTests;

public class OrderLineTests
{
    public class CreateRefundOrderLine_Should
    {
        [Fact]
        public void ReturnAnOrderLine() // Give this a better name!
        {
            var line = new OrderLine
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
            Assert.Equal(-line.LineTotal, refund.LineTotal);
        }

        [Fact]
        public void ThrowExceptionIfRefundOrderLine()
        {
            var line = new OrderLine
            {
                ProductId = 1,
                ProductVariantId = 1,
                OrderId = 1,
                Price = 100,
                Quantity = 1
            };
            var refundLine = line.CreateRefundOrderLine();
            Assert.Throws<InvalidOperationException>(() => refundLine.CreateRefundOrderLine());
        }
    }
}
