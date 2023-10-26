using Eventuras.Services;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Eventuras.WebApi.Controllers.Organizations
{
    public class RoleAttribute : ValidationAttribute
    {
        public override bool IsValid(object value)
        {
            return value is string str &&
                   Roles.All.Contains(str);
        }
    }
}