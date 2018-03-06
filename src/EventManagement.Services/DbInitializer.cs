using System;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace losol.EventManagement.Services
{
	public class DbInitializer : IDbInitializer
	{
		private readonly ApplicationDbContext _db;
		private readonly IServiceProvider _serviceProvider;
		private readonly IConfiguration _config;

		public DbInitializer(ApplicationDbContext db, IServiceProvider service, IConfiguration config)
		{
			_db = db;
			_serviceProvider = service;
			_config = config;
		}

		public async Task SeedAsync()
		{
			_db.Database.Migrate();

			// Add administrator role if it does not exist
			var roleManager = _serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
			string[] roleNames = { "Admin", "SuperAdmin" };
			IdentityResult roleResult;
			foreach (var roleName in roleNames)
			{
				var roleExist = await roleManager.RoleExistsAsync(roleName);
				if (!roleExist)
				{
					roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
				}
			}

			// Add super-admin if none exists
			var userManager = _serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
			if (!userManager.GetUsersInRoleAsync("SuperAdmin").Result.Any())
			{

				if (String.IsNullOrEmpty(_config.GetSection("SuperAdmin")["Email"]))
				{
					throw new System.ArgumentException("SuperAdmin email not set. Please check install documentation");
				}

				if (String.IsNullOrEmpty(_config.GetSection("SuperAdmin")["Password"]))
				{
					throw new System.ArgumentException("SuperAdmin password not set. Please check install documentation");
				}

				var _user = await userManager.FindByEmailAsync(_config.GetSection("SuperAdmin")["Email"]);

				if (_user == null)
				{
					var superadmin = new ApplicationUser
					{
						UserName = _config.GetSection("SuperAdmin")["Email"],
						Email = _config.GetSection("SuperAdmin")["Email"],
						EmailConfirmed = true
					};
					string UserPassword = _config.GetSection("SuperAdmin")["Password"];
					var createSuperAdmin = await userManager.CreateAsync(superadmin, UserPassword);
					if (createSuperAdmin.Succeeded)
					{
						await userManager.AddToRoleAsync(superadmin, "SuperAdmin");
					}
				}

			}

			// Seed payment methods
			if (!_db.PaymentMethods.Any())
			{
				var paymentMethods = new PaymentMethod[] {
					new PaymentMethod {Code="Card", Name="Kortbetaling", Active=false},
					new PaymentMethod {Code="Email_invoice", Name="E-postfaktura", Active=true},
					new PaymentMethod {Code="EHF_invoice", Name="EHF-faktura", Active=true}
				};

				foreach (var item in paymentMethods)
				{
					await _db.PaymentMethods.AddAsync(item);
				}

				await _db.SaveChangesAsync();
			}

			// Seed test events if no events exist. 
			if (!_db.EventInfos.Any())
			{
				var eventInfos = new EventInfo[]
				{
					new EventInfo{Title="Test event 01", Code="Test01", Description="A test event."},
					new EventInfo{Title="Test event 02", Code="Test02", Description="Another test event."}
				};

				foreach (var item in eventInfos)
				{
					await _db.EventInfos.AddAsync(item);
				}

				await _db.SaveChangesAsync();
			}
		}
	}
}
