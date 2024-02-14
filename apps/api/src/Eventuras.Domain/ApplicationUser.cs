#nullable enable

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using NodaTime;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace Eventuras.Domain
{
    public class ApplicationUser : IdentityUser
    {
        // Personal information fields, Name is the full name and will be a calculated field later
        public string? Name { get; set; }
        public string? GivenName { get; set; }
        public string? MiddleName { get; set; }
        public string? FamilyName { get; set; }
        public bool NameVerified { get; set; }

        // Profile picture URL
        public string? PictureUrl { get; set; }

        // Address information
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? ZipCode { get; set; }
        public string? City { get; set; }

        public string? Country { get; set; }

        // Birthdate and verification
        public LocalDate? BirthDate { get; set; }
        public bool BirthDateVerified { get; set; }

        // Professional information
        public string? Profession { get; set; }
        public string? JobRole { get; set; }
        public string? Employer { get; set; }
        public string? EmployerIdentificationNumber { get; set; }
        public string? ProfessionalIdentityNumber { get; set; }
        public bool ProfessionalIdentityNumberVerified { get; set; }

        // Additional user information
        public string? SupplementaryInformation { get; set; }
        public string? SignatureImageBase64 { get; set; }
        public bool Archived { get; set; }

        // Log property and method
        [Column(TypeName = "jsonb")]
        public string Log { get; set; } = "[]";

        public void AddLog(string message, string? userId = null, LogLevel level = LogLevel.Information)
        {
            var logEntry = new
            {
                Timestamp = DateTime.UtcNow.ToString("u"),
                Message = message,
                UserId = userId, // Keep userId as null if it's not provided
                Level = level.ToString()
            };

            var logList = JsonSerializer.Deserialize<List<object>>(Log) ?? new List<object>();
            logList.Add(logEntry);
            Log = JsonSerializer.Serialize(logList);
        }

        // Relationships
        public ICollection<Registration> Registrations { get; set; } = null!;

        public ICollection<OrganizationMember> OrganizationMembership { get; set; } = null!;
    }
}
