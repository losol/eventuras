using losol.EventManagement.Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace losol.EventManagement.Infrastructure
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
        public DbSet<Certificate> Certificates { get; set; }
        public DbSet<MessageLog> MessageLogs { get; set; }

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
