using System.ComponentModel.DataAnnotations;
using System.Linq;
using Eventuras.Services;

namespace Eventuras.WebApi.Controllers.v3.Organizations;

public class RoleAttribute : ValidationAttribute
{
    public override bool IsValid(object value) =>
        value is string str &&
        Roles.All.Contains(str);
}
