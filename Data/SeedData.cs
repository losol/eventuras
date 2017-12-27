using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Models;

namespace losol.EventManagement.Data
{
	public class SeedData
	{
        public static void Initialize(ApplicationDbContext context)
		{
            context.Database.EnsureCreated();
            
			// Look for any events.
			if (context.EventInfos.Any())
			{
				return;   // DB has been seeded
			}

            var eventInfos = new EventInfo[]
            {
                new EventInfo{Title="Test 01", Code="Test01", Description="A test event."},
                new EventInfo{Title="Test 02", Code="TEST02", Description="Another test event."}
            };

            foreach (var item in eventInfos)
            {
                context.EventInfos.AddAsync(item);
            }

            context.SaveChanges();
            


		}
	}
}