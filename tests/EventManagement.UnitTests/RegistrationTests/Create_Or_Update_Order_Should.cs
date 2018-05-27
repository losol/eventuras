using System.Collections.Generic;
using System.Linq;
using losol.EventManagement.Domain;
using Xunit;

namespace losol.EventManagement.UnitTests.RegistrationTests
{
    public class Create_Or_Update_Order_Should
    {
        [Fact]
        public void Create_New_Order_If_Existing_Orders_Are_Invoiced()
        {
            // Arrange
            var registration = new Registration
            {
                Orders = new List<Order> {
                    new Order {
                        OrderLines = new List<OrderLine> {
                            new OrderLine { ProductId = 1 }
                        }
                    }
                }
            };
            foreach(var o in registration.Orders)
            {
                o.MarkAsVerified();
                o.MarkAsInvoiced();
            }
            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 2 }
                }
            };

            // Act
            registration.CreateOrUpdateOrder(dto);

            // Assert
            Assert.Equal(2, registration.Orders.Count);
        }

        [Fact]
        public void Update_Order_If_Existing_Orders_Are_Not_Invoiced()
        {
            // Arrange
            var registration = new Registration
            {
                Orders = new List<Order> {
                    new Order {
                        OrderLines = new List<OrderLine> {
                            new OrderLine { ProductId = 1 }
                        }
                    }
                }
            };
            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 2 }
                }
            };

            // Act
            registration.CreateOrUpdateOrder(dto);

            // Assert
            Assert.Single(registration.Orders);
            Assert.Equal(2, registration.Orders.First().OrderLines.Count);
        }

        [Fact]
        public void Succeed_If_Product_Exists_In_Cancelled_Order()
        {
            // Arrange
            var registration = new Registration
            {
                Orders = new List<Order> {
                    new Order {
                        OrderLines = new List<OrderLine> {
                            new OrderLine { ProductId = 1 }
                        }
                    }
                }
            };
            registration.Orders.First().MarkAsCancelled();
            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 1 }
                }
            };

            // Act
            registration.CreateOrUpdateOrder(dto);

            // Assert
            Assert.Equal(2, registration.Orders.Count);
        }

        [Fact]
        public void Credit_OrderLine_If_Product_Exists_In_Invoiced_Order()
        {
            // Arrange
            var registration = new Registration
            {
                Orders = new List<Order> {
                    new Order {
                        OrderLines = new List<OrderLine> {
                            new OrderLine
                            {
                                ProductId = 1,
                                ProductVariantId = 1,
                                Price = 100,
                                Product = new Product
                                {
                                    ProductId = 1
                                },
                                ProductVariant = new ProductVariant
                                {
                                    ProductVariantId = 1,
                                    ProductId = 1
                                }
                            },
                            new OrderLine
                            {
                                ProductId = 2,
                                Price = 100,
                                Product = new Product
                                {
                                    ProductId = 2
                                }
                            }
                        }
                    }
                }
            };
            registration.Orders.First().MarkAsVerified();
            registration.Orders.First().MarkAsInvoiced();

            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 1, Price = 100 },
                    Variant = new ProductVariant { ProductVariantId = 2, ProductId = 1, Price = 100 }
                }
            };

            // Act
            registration.CreateOrUpdateOrder(dto);

            // Assert
            var last = registration.Orders.Last();
            Assert.Equal(2, registration.Orders.Count);
            Assert.Equal(2, last.OrderLines.Count);
            Assert.Equal(0m, last.TotalAmount);
        }

        [Fact]
        public void Credit_And_Remove_Products_From_Invoiced_Order()
        {
            // Arrange
            var registration = new Registration
            {
                Orders = new List<Order> {
                    new Order {
                        OrderLines = new List<OrderLine> {
                            new OrderLine
                            {
                                ProductId = 1,
                                ProductVariantId = 1,
                                Price = 100,
                                Quantity = 5,
                                Product = new Product
                                {
                                    ProductId = 1
                                },
                                ProductVariant = new ProductVariant
                                {
                                    ProductVariantId = 1,
                                    ProductId = 1
                                }
                            }
                        }
                    }
                }
            };
            registration.Orders.First().MarkAsVerified();
            registration.Orders.First().MarkAsInvoiced();

            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 1, Price = 100 },
                    Quantity = 0
                }
            };

            // Act
            registration.CreateOrUpdateOrder(dto);

            // Assert
            var last = registration.Orders.Last();
            Assert.Equal(-500m, last.TotalAmount);
            Assert.Single(last.OrderLines); // only the refund orderline should exist
        }

        [Fact]
        public void Create_New_Order_When_New_Product_Is_Added()
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
                            new OrderLine
                            {
                                ProductId = 1,
                                ProductName = "Conference ticket (3 days)",
                                Quantity = 1,
                                Price = 1000
                            },
                            new OrderLine
                            {
                                ProductId = 2,
                                ProductVariantId = 1,
                                ProductName = "Small Dinner",
                                Quantity = 1,
                                Price = 400
                            },
                            new OrderLine
                            {
                                ProductId = 3,
                                ProductName = "Daily rate",
                                Quantity = 2,
                                Price = 200
                            },
                        }
                    }
                }
            };
            registration.Orders.ForEach(o =>
                {
                    o.MarkAsVerified();
                    o.MarkAsInvoiced();
                }
            );

            var ordersToAdd = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product
                    {
                        ProductId = 4,
                        Name = "Sightseeing",
                        Price = 800
                    },
                    Quantity = 1
                }
            };

            // Act
            registration.CreateOrUpdateOrder(ordersToAdd);

            // Assert
            // TODO: The assert statement must check for the final products as well
            Assert.Equal(2600, registration.Orders.Sum(o => o.TotalAmount));
        }
    }
}