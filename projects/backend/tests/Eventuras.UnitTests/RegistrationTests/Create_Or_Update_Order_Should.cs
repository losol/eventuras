using Eventuras.Domain;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace Eventuras.UnitTests.RegistrationTests
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
                            Helpers.GetOrderLine(productId: 1, price: 100)
                        }
                    }
                }
            };
            foreach (var o in registration.Orders)
            {
                o.MarkAsVerified();
                o.MarkAsInvoiced();
            }
            var dto = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 2, price: 100)
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
                            Helpers.GetOrderLine(productId: 1, price: 100)
                        }
                    }
                }
            };
            var dto = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 2, price: 400)
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
                Helpers.GetOrderDto(productId: 1, price: 100)
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
                            Helpers.GetOrderLine(productId: 1, price: 100, quantity: 1, variantId: 1),
                            Helpers.GetOrderLine(productId: 2, price: 100)
                        }
                    }
                }
            };
            registration.Orders.First().MarkAsVerified();
            registration.Orders.First().MarkAsInvoiced();

            var dto = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 100, variantId: 2)
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
                            Helpers.GetOrderLine(productId: 1, price: 100, quantity: 5, variantId: 1)
                        }
                    }
                }
            };
            registration.Orders.First().MarkAsVerified();
            registration.Orders.First().MarkAsInvoiced();

            var dto = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, variantId: 1, price: 100, quantity: 0)
            };

            // Act
            registration.CreateOrUpdateOrder(dto);

            // Assert
            var last = registration.Orders.Last();
            Assert.Equal(-500m, last.TotalAmount);
            Assert.Single(last.OrderLines); // only the refund orderline should exist
        }

        #region

        /*
         * The test cases below are straight from the spec
         * https://github.com/losol/Eventuras/blob/master/docs/Specification/Orders.md
         */

        // Case #1
        [Fact]
        public void Create_New_Order_When_New_Product_Is_Added()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            var ordersToAdd = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 4, price: 800, quantity: 1)
            };
            var expectedItems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1),
                Helpers.GetOrderDto(productId: 2, variantId: 1, price: 400, quantity: 1),
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 2),
                Helpers.GetOrderDto(productId: 4, price: 800, quantity: 1),
            };

            // Act
            registration.CreateOrUpdateOrder(ordersToAdd);

            // Assert
            Assert.Equal(2600, registration.Orders.Sum(o => o.TotalAmount));
            Assert.Equal(expectedItems, registration.Products, new OrderDTOProductAndVariantComparer());
        }

        // Case #1 extension
        // Ensure that only orderlines with 0 quantity are discarded
        [Fact]
        public void Create_New_Order_With_One_Orderline_When_New_Product_Is_Added()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            var ordersToAdd = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 4, price: 800, quantity: 1), // new product
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1), // existing product
            };

            // Act
            registration.CreateOrUpdateOrder(ordersToAdd);

            // Assert
            Assert.Single(registration.Orders.Last().OrderLines);
        }

        // Case #2
        [Fact]
        public void Create_New_Order_When_Product_Is_Removed()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            var orderitems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 2, variantId: 1, price: 400, quantity: 0)
            };
            var expectedItems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1),
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 2),
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);

            //Assert
            Assert.Equal(1400, registration.Orders.Sum(o => o.TotalAmount));
            Assert.Equal(expectedItems, registration.Products, new OrderDTOProductAndVariantComparer());
            Assert.Single(registration.Orders.Last().OrderLines);
        }

        // Case #3
        [Fact]
        public void Create_New_Order_When_Product_Quantity_Is_Increased()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            var orderitems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 3)
            };
            var expectedItems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1),
                Helpers.GetOrderDto(productId: 2, variantId: 1, price: 400, quantity: 1),
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 3),
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);

            //Assert
            Assert.Equal(2000, registration.Orders.Sum(o => o.TotalAmount));
            Assert.Equal(expectedItems, registration.Products, new OrderDTOProductAndVariantComparer());
        }

        // Case #4
        [Fact]
        public void Create_New_Order_When_Product_Quantity_Is_Decreased()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            var orderitems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 1)
            };
            var expectedItems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1),
                Helpers.GetOrderDto(productId: 2, variantId: 1, price: 400, quantity: 1),
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 1),
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);

            //Assert
            Assert.Equal(1600, registration.Orders.Sum(o => o.TotalAmount));
            Assert.Equal(expectedItems, registration.Products, new OrderDTOProductAndVariantComparer());
        }

        // Case #5
        [Fact]
        public void Create_New_Order_When_Product_Is_Replaced()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            var orderitems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 2, variantId: 1, price: 400, quantity: 0),
                Helpers.GetOrderDto(productId: 4, price: 800, quantity: 1)
            };
            var expectedItems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1),
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 2),
                Helpers.GetOrderDto(productId: 4, price: 200, quantity: 1)
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);

            //Assert
            Assert.Equal(2200, registration.Orders.Sum(o => o.TotalAmount));
            Assert.Equal(expectedItems, registration.Products, new OrderDTOProductAndVariantComparer());
        }

        // Case #6
        [Fact]
        public void Create_New_Order_When_Variant_Is_Changed()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            var orderitems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 2, variantId: 2, price: 600, quantity: 1), // Small Dinner
            };
            var expectedItems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1),
                Helpers.GetOrderDto(productId: 3, price: 200, quantity: 2),
                Helpers.GetOrderDto(productId: 2, variantId: 2, price: 600, quantity: 1), // large Dinner
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);

            //Assert
            Assert.Equal(expectedItems, registration.Products, new OrderDTOProductAndVariantComparer());
            Assert.Equal(2000, registration.Orders.Sum(o => o.TotalAmount));
        }
        #endregion


        [Fact]
        public void Update_Existing_Order_When_A_Draft_Exists()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            registration.Orders.Add(new Order
            {
                OrderLines = new List<OrderLine>
                {
                    Helpers.GetOrderLine(productId: 4, price: 800, quantity: 1)
                }
            });
            var orderitems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 4, price: 800, quantity: 2)
            };
            var expectedOrderlines = new List<OrderLine>
            {
                Helpers.GetOrderLine(productId: 4, price: 800, quantity: 2)
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);
            var last = registration.Orders.Last().OrderLines;

            //Assert
            Assert.Single(last);
            Assert.Equal(2, last.First().Quantity);
        }

        [Fact]
        public void Update_Existing_Order_When_A_Draft_Exists_Replace_Invoiced_Variant()
        {
            // Arrange
            var registration = Helpers.GetTestCaseRegistration();
            registration.Orders.Add(new Order
            {
                OrderLines = new List<OrderLine>
                {
                    Helpers.GetOrderLine(productId: 4, price: 800, quantity: 1)
                }
            });
            var orderitems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 2, variantId: 2, price: 600, quantity: 1)
            };
            var expectedOrderlines = new List<OrderLine>
            {
                Helpers.GetOrderLine(productId: 4, price: 800, quantity: 1),
                Helpers.GetOrderLine(productId: 2, variantId: 2, price: 600, quantity: 1),
                Helpers.GetOrderLine(productId: 2, variantId: 1, price: 400, quantity: -1)
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);
            var last = registration.Orders.Last().OrderLines;

            //Assert
            Assert.Equal(3, last.Count);
        }


        [Fact]
        public void Not_Add_Items_With_Zero_Quantity()
        {
            // Arrange
            var registration = new Registration()
            {
                Orders = new List<Order>
                {
                    new Order
                    {
                        OrderLines = new List<OrderLine>
                        {
                            Helpers.GetOrderLine(productId: 1, price: 1000, quantity: 1),
                            Helpers.GetOrderLine(productId: 2, price: 1000, quantity: 0)
                        }
                    }
                }
            };
            var orderitems = new List<OrderDTO>
            {
                Helpers.GetOrderDto(productId: 1, price: 1000, quantity: 1),
                Helpers.GetOrderDto(productId: 2, price: 1000, quantity: 0),
                Helpers.GetOrderDto(productId: 3, price: 1000, quantity: 0),
                Helpers.GetOrderDto(productId: 4, price: 1000, quantity: 0),
            };

            // Act
            registration.CreateOrUpdateOrder(orderitems);
            var lines = registration.Orders.First().OrderLines;

            //Assert
            Assert.Single(lines);
            Assert.Equal(1000, registration.Orders.Sum(o => o.TotalAmount));
        }

    }
}
