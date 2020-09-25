using Eventuras.Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Eventuras.Infrastructure
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<EventInfo> EventInfos { get; set; }
        public DbSet<Registration> Registrations { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderLine> OrderLines { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrganizationMember> OrganizationMembers { get; set; }
        public DbSet<Certificate> Certificates { get; set; }
        public DbSet<MessageLog> MessageLogs { get; set; }
        public DbSet<ExternalAccount> ExternalAccounts { get; set; }
        public DbSet<ExternalEvent> ExternalEvents { get; set; }
        public DbSet<ExternalRegistration> ExternalRegistrations { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ExternalEvent>()
                .HasIndex(c => new { c.EventInfoId, c.ExternalServiceName, c.ExternalEventId })
                .IsUnique();

            builder.Entity<ExternalAccount>()
                .HasIndex(a => new { a.ExternalServiceName, a.ExternalAccountId })
                .IsUnique();

            builder.Entity<ExternalRegistration>()
                .HasIndex(e => new { e.ExternalAccountId, e.ExternalEventId })
                .IsUnique();

            builder.Entity<Organization>()
                .HasIndex(o => o.EventurasHostname)
                .HasFilter($@"""{nameof(Organization.EventurasHostname)}"" IS NOT NULL AND ""{nameof(Organization.Active)}"" = true")
                .IsUnique();

            builder.Entity<OrganizationMember>()
                .HasIndex(m => new { m.OrganizationId, m.UserId })
                .IsUnique();
        }

        public void DetachAllEntities()
        {
            var changedEntriesCopy = ChangeTracker.Entries()
                .Where(e => e.State != EntityState.Detached);
            foreach (var entity in changedEntriesCopy)
            {
                Entry(entity.Entity).State = EntityState.Detached;
            }
        }
    }
}
