using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Models;

namespace losol.EventManagement.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }




        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);

        }

        public DbSet<losol.EventManagement.Data.ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<losol.EventManagement.Models.EventInfo> EventInfos { get; set; }
        public DbSet<losol.EventManagement.Models.Registration> Registrations { get; set; }
        public DbSet<losol.EventManagement.Models.PaymentMethod> PaymentMethods { get; set; }
        public DbSet<losol.EventManagement.Models.Product> Product { get; set; }
        public DbSet<losol.EventManagement.Models.ProductVariant> ProductVariant { get; set; }
    }
}
