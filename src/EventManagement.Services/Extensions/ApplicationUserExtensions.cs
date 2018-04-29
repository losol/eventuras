using System.Linq;
using losol.EventManagement.Domain;
using losol.EventManagement.Services.Extensions;
using losol.EventManagement.Services.TalentLms.Models;

namespace EventManagement.Services.Extensions
{
    public static class ApplicationUserExtensions
    {
        public static User NewTalentLmsUser(this ApplicationUser user)
        {
            var spaceSeparatedName = user.Name.Split(' ');
            var lastName = spaceSeparatedName.Last();
            spaceSeparatedName[spaceSeparatedName.Length-1] = "";
            var firstName = string.Join(",", spaceSeparatedName);
            return new User 
            {
                FirstName = firstName,
                LastName = lastName,
                Email = user.Email,
                Login = user.Email,
                Password =  PasswordHelper.GeneratePassword(6)
            };
        }
    }
}