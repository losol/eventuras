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
                            new OrderLine
                            {
                                ProductId = 1,
                                Product = new Product
                                {
                                    ProductId = 1
                                },
                                Quantity = 1,
                                Price = 100
                            },
                            new OrderLine
                            {
                                ProductId = 2,
                                Product = new Product
                                {
                                    ProductId = 2
                                },
                                Quantity = 1,
                                Price = 100
                            }
                        }
                    },
                    new Order
                    {
                        OrderLines = new List<OrderLine>
                        {
                            new OrderLine
                            {
                                ProductId = 3,
                                Product = new Product
                                {
                                    ProductId = 3
                                },
                                Quantity = 1,
                                Price = 100
                            }
                        }
                    }
                }
            };

            var expectedProducts = new List<OrderDTO>
            {
                new OrderDTO { Product = new Product { ProductId = 1 }, Quantity = 1 },
                new OrderDTO { Product = new Product { ProductId = 2 }, Quantity = 1 },
                new OrderDTO { Product = new Product { ProductId = 3 }, Quantity = 1 }
            };

            // Act
            var products = registration.Products;

            // Assert
            Assert.Equal(3, products.Count);
        }
    }
}
