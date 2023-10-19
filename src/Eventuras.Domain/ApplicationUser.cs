#nullable enable

using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace Eventuras.Domain
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class ApplicationUser : IdentityUser
    {
        public string? Name { get; set; }

        // Internal fields
        public string? SignatureImageBase64 { get; set; }

        public bool Archived { get; set; }

        public ICollection<Registration> Registrations { get; set; } = null!;

        public ICollection<OrganizationMember> OrganizationMembership { get; set; } = null!;
    }
}