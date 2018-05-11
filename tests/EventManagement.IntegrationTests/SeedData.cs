using System;
using System.Collections.Generic;
using losol.EventManagement.Domain;

namespace losol.EventManagement.IntegrationTests
{
	public class SeedData
	{
		public static IList<EventInfo> Events =>
			new List<EventInfo>
			{
				// Event with products and variants
				new EventInfo
				{
					EventInfoId = 1,
					Title = "Mangfold beriker arbeidsmiljøet",
					Description = "Hvorfor er mange ledere så opptatt av firmahytte og treningstilbud når de egentlig burde fokusert på rollekonflikter, arbeidstidsforhold eller organisatorisk rettferdighet? Årets IA-konferanse 4.- 5. juni i Bodø har fokus på tillitsbasert ledelse, arbeidsglede og kunsten å virke sammen på jobb.",
					Featured = true,
					Published = true,
					Code = "event-1",
					OnDemand = true,
					City = "Bodø",
					Products = new List<Product>
					{
						new Product
						{
							ProductId = 1,
							EventInfoId = 1,
							Name = "Tickets",
							Price = 1000,
							VatPercent = 5,
							MinimumQuantity = 1,
							ProductVariants = new List<ProductVariant>
							{
								new ProductVariant
								{
									ProductId = 1,
									ProductVariantId = 1,
									Name = "Business",
									Price = 1000,
									VatPercent = 5
								},
								new ProductVariant
								{
									ProductId = 1,
									ProductVariantId = 2,
									Name = "VIP",
									Price = 3000,
									VatPercent = 5
								}
							}
						},
						new Product
						{
							ProductId = 2,
							EventInfoId = 1,
							Name = "Lunch",
							Price = 40,
							VatPercent = 5
						}
					}
				},

				// Event with products but no variants
				new EventInfo
				{
					EventInfoId = 2,
					Title = "Mangfold beriker arbeidsmiljøet",
                    Code = "mangfold-beriker-arbeidsmiljoet",
					Description = "Hvorfor er mange ledere så opptatt av firmahytte og treningstilbud når de egentlig burde fokusert på rollekonflikter, arbeidstidsforhold eller organisatorisk rettferdighet? Årets IA-konferanse 4.- 5. juni i Bodø har fokus på tillitsbasert ledelse, arbeidsglede og kunsten å virke sammen på jobb.",
					Featured = true,
					Published = true,
					OnDemand = true,
					City = "Bodø",
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
					Code = "slug-for-event-3",
					Description = "",
					Featured = true,
					Published = true,
					OnDemand = true,
					City = "Bodø",
				},


				// Unpublished event
				new EventInfo
				{
					EventInfoId = 4,
					Title = "Unpublished event",
					Code = "slug-here-3",
					Featured = false,
					Published = false,
					OnDemand = false,
				},

			};
	}
}
