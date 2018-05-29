using System;
using System.Collections.Generic;
using losol.EventManagement.Domain;
using Xunit;

namespace losol.EventManagement.UnitTests.RegistrationTests
{
    public class Products_Should
    {
        [Fact]
        public void Return_Products_Case_1()
        {
            // Arrange
            Registration registration = new Registration
            {
                Orders = new List<Order>
                {
                    new Order
                    {
                        OrderLines = new List<OrderLine>
                        {
                            Helpers.GetOrderLine(productId: 1, price: 100, quantity: 1),
                            Helpers.GetOrderLine(productId: 2, price: 100, quantity: 1)
                        }
                    },
                    new Order
                    {
                        OrderLines = new List<OrderLine>
                        {
                            Helpers.GetOrderLine(productId: 3, price: 100, quantity: 1)
                        }
                    }
                }
            };

            var expectedProducts = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 100, quantity: 1),
                Helpers.GetOrderDto(productId: 2, price: 100, quantity: 1),
                Helpers.GetOrderDto(productId: 3, price: 100, quantity: 1)
            };

            // Act
            var products = registration.Products;

            // Assert
            Assert.Equal(3, products.Count);
            Assert.Equal(expectedProducts, products, new OrderDTOProductAndVariantComparer());
        }
    }
}
