using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using System.Collections.Generic;

namespace losol.EventManagement.Services.DbInitializers
{
    public class DevelopmentDbInitializer : BaseDbInitializer, IDbInitializer
    {
        public DevelopmentDbInitializer(ApplicationDbContext db, RoleManager<IdentityRole> roleManager,  UserManager<ApplicationUser> userManager, IOptions<DbInitializerOptions> config)
            : base(db, roleManager, userManager, config)
         { }

        public override async Task SeedAsync()
        {
            _db.Database.Migrate();
            await base.SeedAsync();

			if (!_db.EventInfos.Any())
			{
				var eventInfos = new EventInfo[]
				{
					new EventInfo
					{
						Published = true,
						Featured = true,
						OnDemand = true,
							
						Title = "Grunnkurs B - Bodø",
						Code = "grunnkurs-b-bodo",
						Description = "Nordland Legeforening har i mange år arrangert grunnkurs B for allmennleger. Vi legger stor vekt på at kurset skal ha god kvalitet og at du skal ha fine dager i Bodø. Siden kurset er i mars må vi selvsagt by på skreimølje.",
						Location = "Radisson Blu",
						City = "Bodø",

						DateStart = DateTime.UtcNow.AddDays(15),
						DateEnd = DateTime.UtcNow.AddDays(18),
						LastRegistrationDate = DateTime.UtcNow.AddDays(13),
						LastCancellationDate = DateTime.UtcNow.AddDays(14),

						PracticalInformation = "<p>Kursavgiften er på&nbsp;4700,- . Adm, gebyr på 150,- tilkommer og faktureres sammen med middager som er bestilt. Avmeldingsfrist er&nbsp;28. februar&nbsp;2018. Ved avmelding vil du bli belastet et avmeldingsgebyr på 500,- Ved avmelding etter 28.2.18 refunderes ikke kursavgift unntatt ved dokumentert sykdom.</p><p>Kurset starter 10.30 og det er mulig å reise til Bodø med morgenflyet 21. mars. Ekstra overnatting fra dagen før dekkes av Fond II når det er nødvendig. Kurset avslutter rundt 14.00 på siste dag.&nbsp;Hotellinformasjon kommer i velkomstbrevet.</p>",
						Category = "",
						CertificateDescription = "",
						InformationRequest = "",
						MoreInformation = "",
						Program = "",
						WelcomeLetter = "",
						RegistrationsUrl = null,

						Price = null,
						MaxParticipants = 100,
						ManageRegistrations = true,
						FeaturedImageCaption = null,
						FeaturedImageUrl = null,

						// TODO: Add some products here
						// Include a mandatory product
						// and a product with variants
						Products = new List<Product> {
							new Product
							{
								
							}
						},

						// TODO: Create a few registrations here
						// Ensure the users for the same have been seeded first
						Registrations = new List<Registration> {
							new Registration 
							{
									
							}
						}
					}
				};

				await _db.EventInfos.AddRangeAsync(eventInfos);
				await _db.SaveChangesAsync();
			}
        }
    }
}
