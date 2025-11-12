#nullable enable

using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.DbInitializers;

public class DbInitializer : IDbInitializer
{
    private readonly DbInitializerOptions _config;
    private readonly ApplicationDbContext _db;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public DbInitializer(
        ApplicationDbContext db,
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IOptions<DbInitializerOptions> config)
    {
        _db = db;
        _config = config.Value;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public virtual async Task SeedAsync(bool createSuperUser, bool runMigrations)
    {
        if (runMigrations && _db.Database.IsRelational())
        {
            await _db.Database.MigrateAsync();
        }

        IdentityResult identityResult;

        // Add administrator role if it does not exist
        var roleNames = new[] { Roles.Admin, Roles.SuperAdmin, Roles.SystemAdmin };
        foreach (var roleName in roleNames)
        {
            var roleExist = await _roleManager.RoleExistsAsync(roleName);
            if (roleExist)
            {
                continue;
            }

            identityResult = await _roleManager.CreateAsync(new IdentityRole(roleName));
            ThrowIfInvalid(identityResult);
        }

        // Add super-admin if none exists
        if (createSuperUser && _config.SuperAdmin != null &&
            !(await _userManager.GetUsersInRoleAsync(Roles.SuperAdmin)).Any())
        {
            if (string.IsNullOrEmpty(_config.SuperAdmin.Email))
            {
                throw new ArgumentException("SuperAdmin email not set. Please check install documentation");
            }

            if (string.IsNullOrEmpty(_config.SuperAdmin.Password))
            {
                throw new ArgumentException("SuperAdmin password not set. Please check install documentation");
            }

            var superAdmin = await _userManager.FindByEmailAsync(_config.SuperAdmin.Email);
            if (superAdmin == null)
            {
                superAdmin = new ApplicationUser
                {
                    UserName = _config.SuperAdmin.Email, Email = _config.SuperAdmin.Email, EmailConfirmed = true
                };

                var password = _config.SuperAdmin.Password;
                identityResult = await _userManager.CreateAsync(superAdmin, password);
                ThrowIfInvalid(identityResult);

                if (!await _userManager.IsInRoleAsync(superAdmin, Roles.SuperAdmin))
                {
                    identityResult = await _userManager.AddToRoleAsync(superAdmin, Roles.SuperAdmin);
                    ThrowIfInvalid(identityResult);
                }
            }
        }

        // Seed the payment methods if none exist
        if (!_db.PaymentMethods.Any())
        {
            var methods = new[]
            {
                new PaymentMethod
                {
                    Provider = PaymentProvider.EmailInvoice,
                    Name = "Email invoice",
                    Type = PaymentProviderType.Invoice,
                    Active = false
                },
                new PaymentMethod
                {
                    Provider = PaymentProvider.PowerOfficeEmailInvoice,
                    Name = "Epost-faktura",
                    Type = PaymentProviderType.Invoice,
                    Active = true,
                    IsDefault = true
                },
                new PaymentMethod
                {
                    Provider = PaymentProvider.PowerOfficeEHFInvoice,
                    Name = "EHF-faktura",
                    Type = PaymentProviderType.Invoice,
                    Active = true
                }
            };

            _db.PaymentMethods.AddRange(methods);
            await _db.SaveChangesAsync();
        }
    }

    private static void ThrowIfInvalid(IdentityResult identityResult)
    {
        if (identityResult.Succeeded)
        {
            return;
        }

        throw new Exception(identityResult.ToString());
    }
}
