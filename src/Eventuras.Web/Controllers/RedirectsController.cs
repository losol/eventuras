using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Controllers;

public class RedirectsController : Controller
{
    [HttpGet("/Events/Details")]
    public IActionResult RedirectOldEventLinks([FromQuery] int id) => RedirectToPage("/Events/Details", new { id });
}