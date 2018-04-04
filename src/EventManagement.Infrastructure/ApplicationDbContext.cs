using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Infrastructure
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        { }

        public DbSet<losol.EventManagement.Domain.ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<losol.EventManagement.Domain.EventInfo> EventInfos { get; set; }
        public DbSet<losol.EventManagement.Domain.Registration> Registrations { get; set; }
        public DbSet<losol.EventManagement.Domain.PaymentMethod> PaymentMethods { get; set; }
        public DbSet<losol.EventManagement.Domain.Product> Products { get; set; }
        public DbSet<losol.EventManagement.Domain.ProductVariant> ProductVariants { get; set; }
		public DbSet<losol.EventManagement.Domain.Order> Orders { get; set; }
		public DbSet<losol.EventManagement.Domain.OrderLine> OrderLines { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<Certificate>()
                   .OwnsOne<Certificate.CertificateIssuer>(c => c.Issuer);
            builder.Entity<Certificate>()
                    .OwnsOne<Certificate.CertificateRecipient>(c => c.Recipient);
            
        }

		public void DetachAllEntities()
		{
			var changedEntriesCopy = this.ChangeTracker.Entries()
				.Where(e => e.State == EntityState.Added ||
							e.State == EntityState.Modified ||
			           		e.State == EntityState.Unchanged ||
							e.State == EntityState.Deleted)
				.ToList();
			foreach (var entity in changedEntriesCopy)
			{
				this.Entry(entity.Entity).State = EntityState.Detached;
			}
		}
    }
}
