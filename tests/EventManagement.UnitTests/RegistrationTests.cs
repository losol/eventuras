using Xunit;

using losol.EventManagement.Domain;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.UnitTests
{
	public class RegistrationTests
	{
		public class CreateOrder_Should
		{
			[Fact]
			public void Succeed_WhenProvidedWithOnlyProducts()
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
				var products = new List<Product>
				{
					new Product { ProductId = 1, EventInfoId = 1, Price = 1000 }
				};

				// Act
				registration.CreateOrder(products);
				
				// Assert
				Assert.NotNull(registration.Orders);
				Assert.Equal(products[0].Price, registration.Orders[0].OrderLines[0].Price);
			}

			[Fact]
			public void Succeed_WhenProvidedWithProductsAndVariants()
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
				var products = new List<Product>
				{
					new Product { ProductId = 1, EventInfoId = 1, Price = 1000 }
				};
				var variants = new List<ProductVariant>
				{
					new ProductVariant { ProductId = 1, ProductVariantId = 1, Price = 2000 }
				};

				// 
				// Act
				registration.CreateOrder(products, variants);

				// 
				// Assert
				Assert.NotNull(registration.Orders);
				Assert.Equal(variants[0].Price, registration.Orders[0].OrderLines[0].Price);
			}

			[Fact]
			public void ThrowException_WhenProvidedWithNull()
			{
				// Arrange
				var registration = new Registration();

				// Act & Assert
				Assert.Throws<ArgumentNullException>(() => registration.CreateOrder(null));
			}

			[Fact]
			public void ThrowException_WhenProvidedWithInvalidProducts()
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

				// Act & Assert
				Assert.Throws<ArgumentException>(() => registration.CreateOrder(products));
			}

			[Fact]
			public void ThrowException_WhenProvidedWithInvalidProductVariants()
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
				var products = new List<Product>
				{
					new Product { ProductId = 2, EventInfoId = 1 }
				};
				var variants = new List<ProductVariant>
				{
					new ProductVariant { ProductId = 1, ProductVariantId = 2}
				};

				// Act & Assert
				Assert.Throws<ArgumentException>(() => registration.CreateOrder(products, variants));
			}
		}

		public class Verify_Should
		{
			[Fact]
			public void SucceedWhenNotVerified()
			{
				Registration registration = new Registration();
				var expected = true;

				registration.Verify();
				var actual = registration.Verified;

				Assert.Equal(expected, actual);
			}

			[Fact]
			public void SucceedWhenAlreadyVerified()
			{
				Registration registration = new Registration { Verified = true };
				var expected = true;

				registration.Verify();
				var actual = registration.Verified;

				Assert.Equal(expected, actual);
			}
		}

		public class RegisterAttendance_Should
		{
			[Fact]
			public void SucceedWhenNotNotAttended()
			{
				Registration registration = new Registration();
				var expected = true;

				registration.RegisterAttendance();
				var actual = registration.Attended;

				Assert.Equal(expected, actual);
			}

			[Fact]
			public void SucceedWhenAlreadyAttended()
			{
				Registration registration = new Registration { Attended = true };
				var expected = true;

				registration.RegisterAttendance();
				var actual = registration.Attended;

				Assert.Equal(expected, actual);
			}
		}

		public class RemoveAttendance_Should
		{
			[Fact]
			public void SucceedWhenNotAttended()
			{
				Registration registration = new Registration();
				var expected = false;

				registration.RemoveAttendance();
				var actual = registration.Attended;

				Assert.Equal(expected, actual);
			}

			[Fact]
			public void SucceedWhenAlreadyAttended()
			{
				Registration registration = new Registration { Attended = true };
				var expected = false;

				registration.RemoveAttendance();
				var actual = registration.Attended;

				Assert.Equal(expected, actual);
			}
		}
	}
}
