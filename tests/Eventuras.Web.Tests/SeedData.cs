using System;
using System.Collections.Generic;
using Eventuras.Domain;
using NodaTime;
using static Eventuras.Domain.EventInfo;

namespace Eventuras.Web.Tests
{
    [Obsolete("Tests that rely on this data should create")]
    public class SeedData
    {
        public static readonly EventInfo[] Events = {
				// Event with products and variants
				new EventInfo
                {
                    EventInfoId = 1,
                    Title = "The first great event",
                    Description = "All other event are fake. This is a great mega event!",
                    Slug = "first-great-event",
                    Featured = true,
                    DateStart = SystemClock.Instance.Today().PlusDays(-1),
                    DateEnd = SystemClock.Instance.Today().PlusDays(1),
                    Type = EventInfoType.Conference,
                    City = "Red city",
                    Products = new List<Product>
                    {
                        new Product
                        {
                            ProductId = 1,
                            EventInfoId = 1,
                            Name = "Tickets",
                            VatPercent = 5,
                            MinimumQuantity = 1,
                            ProductVariants = new List<ProductVariant>
                            {
                                new ProductVariant
                                {
                                    ProductId = 1,
                                    ProductVariantId = 1,
                                    Name = "Business",
                                    VatPercent = 5
                                },
                                new ProductVariant
                                {
                                    ProductId = 1,
                                    ProductVariantId = 2,
                                    Name = "VIP",
                                    VatPercent = 5
                                }
                            }
                        },
                        new Product
                        {
                            ProductId = 2,
                            EventInfoId = 1,
                            Name = "Lunch",
                            VatPercent = 5
                        }
                    }
                },

				// Event with products but no variants
				new EventInfo
                {
                    EventInfoId = 2,
                    Title = "The next event",
                    Slug = "the-next-event",
                    Description = "The second event is much more difficult. ",
                    Featured = true,
                    City = "White City",
                    Products = new List<Product>
                    {
                        new Product
                        {
                            ProductId = 3,
                            EventInfoId = 2,
                            Name = "Tickets",
                            Price = 1000,
                            VatPercent = 5,
                            MinimumQuantity = 1
                        },
                        new Product
                        {
                            ProductId = 4,
                            EventInfoId = 2,
                            Name = "Lunch",
                            Price = 40,
                            VatPercent = 5
                        }
                    },
                },

				// Event with no products or variants
				new EventInfo
                {
                    EventInfoId = 3,
                    Title = "",
                    Description = "",
                    Featured = true,
                    Published = true,
                    OnDemand = true,
                    City = "Bodø",
                    Slug = "bodo"
                },


				// Unpublished event
				new EventInfo
                {
                    EventInfoId = 4,
                    Featured = false,
                    Published = false,
                    OnDemand = false,
                    Slug = "unpublished"
                },

            };
    }
}
