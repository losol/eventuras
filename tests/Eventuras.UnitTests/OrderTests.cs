﻿using Eventuras.Domain;
using System;
using System.Collections.Generic;
using Xunit;
using static Eventuras.Domain.Order;

namespace Eventuras.UnitTests
{
    public class OrderTests
    {
        public class SetStatus_Should
        {
            [Theory]
            [InlineData(OrderStatus.Draft, OrderStatus.Verified)]
            [InlineData(OrderStatus.Verified, OrderStatus.Invoiced)]
            [InlineData(OrderStatus.Verified, OrderStatus.Cancelled)]
            [InlineData(OrderStatus.Draft, OrderStatus.Cancelled)]
            [InlineData(OrderStatus.Invoiced, OrderStatus.Refunded)]
            [InlineData(OrderStatus.Invoiced, OrderStatus.Cancelled)]
            public void Succeed(OrderStatus from, OrderStatus to)
            {
                var order = getOrderWithStatus(from);
                order.Status = to;
                Assert.Equal(to, order.Status);
            }

            [Theory]
            [InlineData(OrderStatus.Verified, OrderStatus.Draft)]
            [InlineData(OrderStatus.Draft, OrderStatus.Invoiced)]
            [InlineData(OrderStatus.Cancelled, OrderStatus.Invoiced)]
            [InlineData(OrderStatus.Invoiced, OrderStatus.Verified)]
            [InlineData(OrderStatus.Draft, OrderStatus.Refunded)]
            public void ThrowInvalidOperationException(OrderStatus from, OrderStatus to)
            {
                var order = getOrderWithStatus(from);
                Assert.Throws<InvalidOperationException>(() => order.Status = to);
            }
        }

        public class CanEdit_Should
        {
            [Theory]
            [InlineData(OrderStatus.Draft)] // test for default value (draft)
            [InlineData(OrderStatus.Verified)]
            public void ReturnTrue(OrderStatus status)
            {
                var order = getOrderWithStatus(status);
                Assert.True(order.CanEdit);
            }

            [Theory]
            [InlineData(OrderStatus.Cancelled)]
            [InlineData(OrderStatus.Invoiced)]
            [InlineData(OrderStatus.Refunded)]
            public void ReturnFalse(OrderStatus status)
            {
                var order = getOrderWithStatus(status);
                Assert.False(order.CanEdit);
            }
        }

        public class CreateRefundOrder_Should
        {
            [Fact]
            public void ThrowExceptionIfNotInvoiced()
            {
                Order order = new Order();
                Assert.Throws<InvalidOperationException>(() => order.CreateRefundOrder());
            }

            [Fact]
            public void Succeed()
            {
                Order order = getOrderWithStatus(OrderStatus.Invoiced);
                order.OrderLines = new List<OrderLine>
                {
                    new OrderLine { ProductId = 1, Quantity = 1, Price = 10 },
                    new OrderLine { ProductId = 2, Quantity = 1, Price = 10 }
                };
                var refund = order.CreateRefundOrder();
                Assert.Equal(-order.TotalAmount, refund.TotalAmount);
            }
        }

        protected static Order getOrderWithStatus(OrderStatus status)
        {
            // Create a new order
            Order order = new Order();

            // Set its status using reflection
            var propinfo = order.GetType().GetField("_status", System.Reflection.BindingFlags.NonPublic
    | System.Reflection.BindingFlags.Instance);
            propinfo.SetValue(order, status);

            return order;
        }

    }
}
