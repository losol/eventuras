using System;
using losol.EventManagement.Domain;
using Xunit;
using static losol.EventManagement.Domain.Order;

namespace losol.EventManagement.UnitTests
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
			[InlineData(OrderStatus.Invoiced, OrderStatus.Cancelled)]
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
