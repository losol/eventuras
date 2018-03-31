using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Web.Controllers.Api
{
	[Route("api/v0/users")]
	[Authorize(Policy = "AdministratorRole")]
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
			                     .Select(u => new { Name = u.Name, Email = u.Email, Phone = u.PhoneNumber })
			                     .ToListAsync();
			return Ok(users);
		}
	}
}
