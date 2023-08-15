using System.Linq;
using Eventuras.Domain;

namespace Eventuras.ViewModels;

public class ParticipantViewModel
{
    public ParticipantViewModel(ApplicationUser user)
    {
        // TODO Split name in applicationUser
        var parts = user.Name.Split(' ');
        var familyName = parts.LastOrDefault();
        var givenName = string.Join(" ", parts.Take(parts.Length - 1));

        UserId = user.Id;
        GivenName = givenName;
        FamilyName = familyName;

        PhoneNumber = user.PhoneNumber;
        Email = user.Email;
    }

    public string UserId { get; set; }

    public string GivenName { get; set; }

    public string FamilyName { get; set; }

    public string PhoneNumber { get; set; }

    public string Email { get; set; }
}