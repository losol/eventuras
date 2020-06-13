using System;
using System.Collections.Generic;
using Eventuras.Domain;
using Xunit;

namespace Eventuras.UnitTests.RegistrationTests
{
    public class Create_Order_Should
    {
        [Fact]
        public void Succeed_When_Provided_With_Only_Products()
        {
            // Arrange
            // Registration for an event#1 with Product#1
            var registration = new Registration
            {
                EventInfoId = 1,
                EventInfo = new EventInfo
                {
                    EventInfoId = 1,
                    Products = new List<Product>
                    {
                        new Product { ProductId = 1, EventInfoId = 1 }
                    }
                }
            };
            // Products that belong to the event being registered for
            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 1, EventInfoId = 1, Price = 1000 }
                }
            };

            // Act
            registration.CreateOrder(dto);

            // Assert
            Assert.NotNull(registration.Orders);
            Assert.Equal(dto[0].Product.Price, registration.Orders[0].OrderLines[0].Price);
        }

        [Fact]
        public void Succeed_When_Provided_With_Products_And_Variants()
        {
            // Arrange
            // Registration for an event#1 with Product#1
            var registration = new Registration
            {
                EventInfoId = 1,
                EventInfo = new EventInfo
                {
                    EventInfoId = 1,
                    Products = new List<Product>
                    {
                        new Product
                        {
                            ProductId = 1,
                            EventInfoId = 1,
                            ProductVariants = new List<ProductVariant>
                            {
                                new ProductVariant
                                {
                                    ProductVariantId = 1,
                                    ProductId = 1
                                }
                            }
                        }
                    }
                }
            };
            // Products that belong to the event being registered for
            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 1, EventInfoId = 1, Price = 1000 },
                    Variant = new ProductVariant { ProductId = 1, ProductVariantId = 1, Price = 2000 }
                }
            };

            //
            // Act
            registration.CreateOrder(dto);

            //
            // Assert
            Assert.NotNull(registration.Orders);
            Assert.Equal(dto[0].Variant.Price, registration.Orders[0].OrderLines[0].Price);
        }

        [Fact]
        public void Throw_Exception_When_Provided_With_Null()
        {
            // Arrange
            var registration = new Registration();

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => registration.CreateOrder(null));
        }

        [Fact]
        public void Throw_Exception_When_Provided_With_Invalid_Products()
        {
            // Arrange
            // Registration for an event#1 with Product#1
            var registration = new Registration
            {
                EventInfoId = 1,
                EventInfo = new EventInfo
                {
                    EventInfoId = 1,
                    Products = new List<Product>
                    {
                        new Product { ProductId = 1, EventInfoId = 1 }
                    }
                }
            };
            // Products that don't belong to the event being registered for
            var products = new List<Product>
            {
                new Product { ProductId = 2, EventInfoId = 2 }
            };
            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 2, EventInfoId = 2 }
                }
            };

            // Act & Assert
            Assert.Throws<ArgumentException>(() => registration.CreateOrder(dto));
        }

        [Fact]
        public void Throw_Exception_When_Provided_With_Invalid_Product_Variants()
        {
            // Arrange
            // Registration for an event#1 with Product#1
            var registration = new Registration
            {
                EventInfoId = 1,
                EventInfo = new EventInfo
                {
                    EventInfoId = 1,
                    Products = new List<Product>
                    {
                        new Product
                        {
                            ProductId = 1,
                            EventInfoId = 1,
                            ProductVariants = new List<ProductVariant>
                            {
                                new ProductVariant
                                {
                                    ProductId = 1,
                                    ProductVariantId = 1
                                }
                            }
                        }
                    }
                }
            };
            // Products that don't belong to the event being registered for
            var dto = new List<OrderDTO>
            {
                new OrderDTO
                {
                    Product = new Product { ProductId = 2, EventInfoId = 1 },
                    Variant = new ProductVariant { ProductId = 1, ProductVariantId = 2 }
                }
            };

            // Act & Assert
            Assert.Throws<ArgumentException>(() => registration.CreateOrder(dto));
        }
    }
}