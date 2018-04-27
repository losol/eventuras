
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventManagement.Services.Extensions;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.Services.TalentLms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace losol.EventManagement.Web.Api.Controllers
{
	[Route("api/v0/events")]
	public class EventsController : Controller
	{
		private readonly IEventInfoService _eventsService;

		public EventsController(IEventInfoService eventsService)
		{
			_eventsService = eventsService;
		}

		[HttpGet, Route("upcoming")]
		public async Task<IActionResult> Get()
		{
			var events = await _eventsService.GetEventsAsync();
			var list = events.Select(s => new
			{
				Id = s.EventInfoId,
				s.Title,
				s.Description,
				s.Location,
				s.City,
				s.DateStart,
				s.DateEnd,
				s.FeaturedImageUrl
			});
			return Ok(list);
		}

		[Authorize] // to be used by the user trying to view a course
		[HttpGet("course_link/{courseId}")]
		public async Task<IActionResult> GetCourseLink(
				[FromServices]ITalentLmsService talentLmsService, 
				[FromServices]UserManager<ApplicationUser> userManager,
				[FromRoute]int courseId)
		{
			var user = await talentLmsService.GetUserAsync(User.Identity.Name);
			
			if(user?.Id.HasValue != true)
			{
				var appUser = await userManager.FindByNameAsync(User.Identity.Name);
				user = await talentLmsService.CreateUser(appUser.NewTalentLmsUser());
			}
			await talentLmsService.EnrolUserToCourse(user.Id.Value, courseId);

			var link = await talentLmsService.GetCourseLink(user.Id.Value, courseId);
			if(link == null) return BadRequest();
			return Ok(new { link });
		}

	}
}