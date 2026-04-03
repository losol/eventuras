#nullable enable

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using NodaTime;

namespace Eventuras.Domain;

public class ApplicationUser
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    [MaxLength(256)]
    public string? UserName { get; set; }

    [MaxLength(256)]
    public string? NormalizedUserName { get; set; }

    [MaxLength(256)]
    public required string Email { get; set; }

    [MaxLength(256)]
    public string NormalizedEmail { get; set; } = null!;

    public bool EmailConfirmed { get; set; }

    public string? PhoneNumber { get; set; }

    public bool PhoneNumberConfirmed { get; set; }

    public string Name =>
        $"{GivenName} {(string.IsNullOrEmpty(MiddleName) ? "" : MiddleName + " ")}{FamilyName}".Trim();

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

    // Relationships
    [JsonIgnore] public ICollection<Registration> Registrations { get; set; } = null!;

    public ICollection<OrganizationMember> OrganizationMembership { get; set; } = null!;
}
