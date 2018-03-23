using System;
using losol.EventManagement.Domain;
using Xunit;
using static losol.EventManagement.Domain.Order;

namespace losol.EventManagement.UnitTests
{
	public class OrderTests
	{
		public class CanEdit_Should
		{
			[Theory]
			[InlineData(OrderStatus.Draft)]
			[InlineData(OrderStatus.Verified)]
			public void ReturnTrue(OrderStatus status)
			{
				var order = new Order
				{
					Status = status
				};
				Assert.True(order.CanEdit);
			}

			[Theory]
			[InlineData(OrderStatus.Invoiced)]
			[InlineData(OrderStatus.Paid)]
			[InlineData(OrderStatus.Refunded)]
			public void ReturnFalse(OrderStatus status)
			{
				var order = new Order
				{
					Status = status
				};
				Assert.False(order.CanEdit);
			}
		}
	}
}
