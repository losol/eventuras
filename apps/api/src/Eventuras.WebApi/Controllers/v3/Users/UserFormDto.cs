using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Users;

public class UserFormDto
{
    [Required][EmailAddress] public string Email { get; set; }

    [Phone] public string PhoneNumber { get; set; }

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
    public LocalDate? BirthDate { get; set; } // Ensure LocalDate is correctly handled or use DateTime
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
    public bool Archived { get; set; }

    public void CopyTo(ApplicationUser user)
    {
        user.Email = Email;
        user.PhoneNumber = PhoneNumber;
        user.GivenName = GivenName;
        user.MiddleName = MiddleName;
        user.FamilyName = FamilyName;
        user.NameVerified = NameVerified;
        user.PictureUrl = PictureUrl;
        user.AddressLine1 = AddressLine1;
        user.AddressLine2 = AddressLine2;
        user.ZipCode = ZipCode;
        user.City = City;
        user.Country = Country;
        user.BirthDate = BirthDate;
        user.BirthDateVerified = BirthDateVerified;
        user.Profession = Profession;
        user.JobRole = JobRole;
        user.Employer = Employer;
        user.EmployerIdentificationNumber = EmployerIdentificationNumber;
        user.ProfessionalIdentityNumber = ProfessionalIdentityNumber;
        user.ProfessionalIdentityNumberVerified = ProfessionalIdentityNumberVerified;
        user.SupplementaryInformation = SupplementaryInformation;
        user.Archived = Archived;
    }
}
