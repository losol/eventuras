using System.Collections.Generic;
using System.Linq;
using Eventuras.Domain;
using Eventuras.WebApi.Controllers.v3.Organizations;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Users;

public class UserDto
{
    public UserDto() { }

    public UserDto(ApplicationUser user)
    {
        Id = user.Id;
        Name = user.Name;
        Email = user.Email;
        PhoneNumber = user.PhoneNumber;

        // Mapping the additional fields
        GivenName = user.GivenName;
        MiddleName = user.MiddleName;
        FamilyName = user.FamilyName;
        NameVerified = user.NameVerified;
        PictureUrl = user.PictureUrl;
        AddressLine1 = user.AddressLine1;
        AddressLine2 = user.AddressLine2;
        ZipCode = user.ZipCode;
        City = user.City;
        Country = user.Country;
        BirthDate = user.BirthDate;
        BirthDateVerified = user.BirthDateVerified;
        Profession = user.Profession;
        JobRole = user.JobRole;
        Employer = user.Employer;
        EmployerIdentificationNumber = user.EmployerIdentificationNumber;
        ProfessionalIdentityNumber = user.ProfessionalIdentityNumber;
        ProfessionalIdentityNumberVerified = user.ProfessionalIdentityNumberVerified;
        SupplementaryInformation = user.SupplementaryInformation;
        Archived = user.Archived;

        if (user.OrganizationMembership != null)
        {
            OrganizationMembership = user.OrganizationMembership.Select(om => new OrganizationMemberDto(om)).ToList();
        }
    }

    public string Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }

    // Personal information fields
    public string GivenName { get; set; }
    public string MiddleName { get; set; }
    public string FamilyName { get; set; }
    public bool NameVerified { get; set; }

    // Profile picture URL
    public string PictureUrl { get; set; }

    // Address information
    public string AddressLine1 { get; set; }
    public string AddressLine2 { get; set; }
    public string ZipCode { get; set; }
    public string City { get; set; }
    public string Country { get; set; }

    // Birthdate and verification
    public LocalDate? BirthDate { get; set; }
    public bool BirthDateVerified { get; set; }

    // Professional information
    public string Profession { get; set; }
    public string JobRole { get; set; }
    public string Employer { get; set; }
    public string EmployerIdentificationNumber { get; set; }
    public string ProfessionalIdentityNumber { get; set; }
    public bool ProfessionalIdentityNumberVerified { get; set; }

    // Additional user information
    public string SupplementaryInformation { get; set; }
    public List<OrganizationMemberDto> OrganizationMembership { get; set; }
    public bool Archived { get; set; }
}
