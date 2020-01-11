using losol.EventManagement.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Web.Controllers.Api.V0
{
    [ApiVersion("0")]
    [Route("api/v0/users")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    public class UsersController : Controller
    {
        private readonly ApplicationDbContext _db; // TODO: Get rid of this
        public UsersController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _db.Users
                                 .Select(u => new { Id = u.Id, Name = u.Name, Email = u.Email, Phone = u.PhoneNumber })
                                 .ToListAsync();
            return Ok(users);
        }
    }
}
