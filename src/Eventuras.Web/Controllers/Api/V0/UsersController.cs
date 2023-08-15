using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Controllers.Api.V0;

[ApiVersion("0")]
[Route("api/v0/users")]
[Authorize(Policy = AuthPolicies.AdministratorRole)]
public class UsersController : Controller
{
    private readonly IUserRetrievalService _userRetrievalService;

    public UsersController(IUserRetrievalService userRetrievalService)
    {
        _userRetrievalService = userRetrievalService ?? throw new ArgumentNullException(nameof(userRetrievalService));
    }

    [HttpGet("")]
    public async Task<IActionResult> GetUsers()
    {
        var users = (await _userRetrievalService.ListUsersAsync()).Select(u => new { u.Id, u.Name, u.Email, Phone = u.PhoneNumber }).ToList();
        return Ok(users);
    }
}