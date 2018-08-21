using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using static losol.EventManagement.Domain.PaymentMethod;

namespace losol.EventManagement.Services.DbInitializers
{
    public abstract class BaseDbInitializer : IDbInitializer
    {
        protected readonly ApplicationDbContext _db;
		private readonly RoleManager<IdentityRole> _roleManager;
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly DbInitializerOptions _config;

		public BaseDbInitializer(ApplicationDbContext db,
		                         RoleManager<IdentityRole> roleManager,
		                         UserManager<ApplicationUser> userManager,
		                         IOptions<DbInitializerOptions> config)
		{
			_db = db;
			_config = config.Value ?? throw new ArgumentNullException(nameof(config));
			_roleManager = roleManager;
			_userManager = userManager;
		}

        public virtual async Task SeedAsync()
        {
            // Add administrator role if it does not exist
			string[] roleNames = { "Admin", "SuperAdmin" };
			IdentityResult roleResult;
			foreach (var roleName in roleNames)
			{
				var roleExist = await _roleManager.RoleExistsAsync(roleName);
				if (!roleExist)
				{
					roleResult = await _roleManager.CreateAsync(new IdentityRole(roleName));
				}
			}

			// Add super-admin if none exists
			if (!_userManager.GetUsersInRoleAsync("SuperAdmin").Result.Any())
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
						await _userManager.AddToRoleAsync(superadmin, "SuperAdmin");
					}
				}

			}

            // Seed the payment methods if none exist
            if (!_db.PaymentMethods.Any())
            {
                var methods = new PaymentMethod[] {
                    new PaymentMethod {
                        Provider = PaymentProvider.EmailInvoice,
                        Name = "Kortbetaling",
                        Type = PaymentProviderType.Invoice,
                        Active = true,
                    },
                    new PaymentMethod {
                        Provider = PaymentProvider.PowerOfficeEmailInvoice,
                        Name = "E-postfaktura",
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
