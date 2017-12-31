using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace losol.EventManagement.Data
{
	public class SeedData
	{
        public static async Task Initialize(ApplicationDbContext context, IServiceProvider service)
		{
            context.Database.EnsureCreated();

            // Add administrator role if it does not exist
            var RoleManager = service.GetRequiredService<RoleManager<IdentityRole>>();
            string[] roleNames = { "Admin", "SuperAdmin" };
            IdentityResult roleResult;
            foreach (var roleName in roleNames)
            {
                var roleExist = await RoleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    roleResult = await RoleManager.CreateAsync(new IdentityRole(roleName));
                }
            }
            
			// Seed test events if no events exist. 
			if (!context.EventInfos.Any())
			{
				var eventInfos = new EventInfo[]
                {
                    new EventInfo{Title="Test event 01", Code="Test01", Description="A test event."},
                    new EventInfo{Title="Test event 02", Code="Test02", Description="Another test event."}
                };

                foreach (var item in eventInfos)
                {
                    await context.EventInfos.AddAsync(item);
                }

                context.SaveChanges();
			}
		}
	}
}