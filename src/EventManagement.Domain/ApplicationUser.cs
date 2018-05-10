using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace losol.EventManagement.Domain
{
	// Add profile data for application users by adding properties to the ApplicationUser class
	public class ApplicationUser : IdentityUser
	{
		public string Name { get; set; }

		// Internal fields
		public string SignatureImageBase64 { get; set;} 
		public bool Archived { get; set; }

		public ICollection<Registration> Registrations { get; set; }
	}
}
