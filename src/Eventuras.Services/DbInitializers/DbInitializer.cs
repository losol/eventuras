using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Threading.Tasks;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.DbInitializers
{
    public class DbInitializer : IDbInitializer
    {
        protected readonly ApplicationDbContext _db;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly DbInitializerOptions _config;

        public DbInitializer(ApplicationDbContext db,
                                 RoleManager<IdentityRole> roleManager,
                                 UserManager<ApplicationUser> userManager,
                                 IOptions<DbInitializerOptions> config)
        {
            _db = db;
            _config = config.Value ?? throw new ArgumentNullException(nameof(config));
            _roleManager = roleManager;
            _userManager = userManager;
        }

        public virtual async Task SeedAsync(
            bool createSuperUser,
            bool runMigrations)
        {
            if (runMigrations)
            {
                await _db.Database.MigrateAsync();
            }

            // Add administrator role if it does not exist
            string[] roleNames = { Roles.Admin, Roles.SuperAdmin, Roles.SystemAdmin };
            IdentityResult roleResult;
            foreach (var roleName in roleNames)
            {
                var roleExist = await _roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    roleResult = await _roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            if (createSuperUser)
            {
                // Add super-admin if none exists
                if (!_userManager.GetUsersInRoleAsync(Roles.SuperAdmin).Result.Any())
                {
                    _ = _config?.SuperAdmin?.Email ?? throw new ArgumentException("SuperAdmin email not set. Please check install documentation");
                    _ = _config?.SuperAdmin?.Password ?? throw new ArgumentException("SuperAdmin password not set. Please check install documentation");

                    var user = await _userManager.FindByEmailAsync(_config.SuperAdmin.Email);

                    if (user == null)
                    {
                        var superadmin = new ApplicationUser
                        {
                            UserName = _config.SuperAdmin.Email,
                            Email = _config.SuperAdmin.Email,
                            EmailConfirmed = true
                        };
                        string UserPassword = _config.SuperAdmin.Password;
                        var createSuperAdmin = await _userManager.CreateAsync(superadmin, UserPassword);
                        if (createSuperAdmin.Succeeded)
                        {
                            await _userManager.AddToRoleAsync(superadmin, Roles.SuperAdmin);
                        }
                    }

                }
            }

            // Seed the payment methods if none exist
            if (!_db.PaymentMethods.Any())
            {
                var methods = new PaymentMethod[] {
                    new PaymentMethod {
                        Provider = PaymentProvider.EmailInvoice,
                        Name = "Email invoice",
                        Type = PaymentProviderType.Invoice,
                        Active = false,
                    },
                    new PaymentMethod {
                        Provider = PaymentProvider.PowerOfficeEmailInvoice,
                        Name = "Epost-faktura",
                        Type = PaymentProviderType.Invoice,
                        Active = true,
                        IsDefault = true
                    },
                    new PaymentMethod {
                        Provider = PaymentProvider.PowerOfficeEHFInvoice,
                        Name = "EHF-faktura",
                        Type = PaymentProviderType.Invoice,
                        Active = true
                    },
                };
                _db.AddRange(methods);
                await _db.SaveChangesAsync();
            }
        }
    }
}
