using System;
using System.Collections.Generic;
using losol.EventManagement.Domain;
using Xunit;

namespace losol.EventManagement.UnitTests.RegistrationTests
{
    public class Products_Should
    {
        [Fact]
        public void Return_Products_Simple_TestCase()
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

        /// <summary>
        /// Test case taken from https://github.com/losol/EventManagement/issues/236
        /// </summary>
        [Fact]
        public void Return_Products_Complex_TestCase()
        {
            // Arrange
            var registration = new Registration
            {
                Orders = new List<Order>
                {
                    new Order
                    {
                        OrderId = 255,
                        OrderLines = new List<OrderLine>
                        {
                            Helpers.GetOrderLine(productId: 1, price: 1000, quantity: 1), // Conference ticket (3 days)
                            Helpers.GetOrderLine(productId: 2, variantId: 1, price: 400, quantity: 1), // Small Dinner
                            Helpers.GetOrderLine(productId: 3, price: 200, quantity: 3) // Daily rate
                        }
                    },
                    new Order
                    {
                        OrderId = 256,
                        OrderLines = new List<OrderLine>
                        {
                            Helpers.GetOrderLine(productId: 4, price: 800, quantity: 1) // Sightseeing
                        }
                    },
                    new Order
                    {
                        OrderId = 257,
                        OrderLines = new List<OrderLine>
                        {
                            Helpers.GetOrderLine(productId: 3, price: 200, quantity: -1) // Daily rate
                        }
                    },
                    new Order
                    {
                        OrderId = 258,
                        OrderLines = new List<OrderLine>
                        {
                            Helpers.GetOrderLine(productId: 4, price: 800, quantity: -1) // Sightseeing
                        }
                    }
                }
            };
            registration.Orders.ForEach(o => {
                o.MarkAsVerified();
                o.MarkAsInvoiced();
            });

            var expectedProducts = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1),
                Helpers.GetOrderDto(productId: 2, variantId: 1, price: 400, quantity: 1),
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 2)
            };

            // Act
            var products = registration.Products;

            // Assert
            Assert.Equal(expectedProducts, products, new OrderDTOProductAndVariantComparer());
        }



    }
}
