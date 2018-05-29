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
                            getOrderLine(productId: 1, price: 100)
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
                            getOrderLine(productId: 1, price: 100)
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
                            getOrderLine(productId: 1, price: 100, quantity: 1, variantId: 1),
                            getOrderLine(productId: 2, price: 100)
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
                            getOrderLine(productId: 1, price: 100, quantity: 5, variantId: 1)
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
                    Variant = new ProductVariant { ProductVariantId = 1, ProductId = 1 },
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

        /*
         * The test cases below are straight from the spec
         * https://github.com/losol/EventManagement/blob/master/docs/Specification/Orders.md
         */

        // Case #1
        [Fact]
        public void Create_New_Order_When_New_Product_Is_Added()
        {
            // Arrange
            var registration = getTestCaseRegistration();
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

        // Case #2
        [Fact]
        public void Create_New_Order_When_Product_Is_Removed()
        {
            // Arrange
            var registration = getTestCaseRegistration();
            var orderitems = new List<OrderDTO>
            {
                getOrderDto(productId: 2, variantId: 1, price: 400, quantity: 0)
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);

            //Assert
            Assert.Equal(1400, registration.Orders.Sum(o => o.TotalAmount));
        }


        private OrderLine getOrderLine(int productId, decimal price, int quantity = 1, int? variantId = null)
        {
            return new OrderLine
            {
                ProductId = productId,
                Product = new Product
                {
                    ProductId = productId
                },
                Price = price,
                Quantity = quantity,

                ProductVariantId = variantId,
                ProductVariant = variantId.HasValue ? new ProductVariant
                {
                    ProductVariantId = variantId.Value,
                    ProductId = productId
                } : null
            };
        }

        private OrderDTO getOrderDto(int productId, decimal price, int quantity = 1, int? variantId = null)
        {
            return new OrderDTO
            {
                Product = new Product { ProductId = productId, Price = price },
                Variant = variantId.HasValue ? new ProductVariant
                {
                    ProductVariantId = variantId.Value,
                    ProductId = productId,
                    Price = price
                } : null,
                Quantity = quantity
            };
        }

        private Registration getTestCaseRegistration()
        {
            var registration = new Registration
            {
                Orders = new List<Order>
                {
                    new Order
                    {
                        OrderId = 255,
                        OrderLines = new List<OrderLine>
                        {
                            getOrderLine(productId: 1, price: 1000, quantity: 1), // Conference ticket (3 days)
                            getOrderLine(productId: 2, variantId: 1, price: 400, quantity: 1), // Small Dinner
                            getOrderLine(productId: 3, price: 200, quantity: 2) // Daily rate
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
            return registration;
        }
    }
}