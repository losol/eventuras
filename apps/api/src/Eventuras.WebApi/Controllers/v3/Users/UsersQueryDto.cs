using Eventuras.Services.Users;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Users;

public class UsersQueryDto : PageQueryDto
{
    [FromQuery] public string Query { get; set; }

    public int? OrganizationId { get; set; }
    public bool IncludeOrgMembership { get; set; } = false;

    public UserListOrder Order { get; set; } = UserListOrder.GivenName;

    public bool Descending { get; set; }

    public UserFilter ToUserFilter() =>
        new() { Query = Query, OrganizationId = OrganizationId };
}
