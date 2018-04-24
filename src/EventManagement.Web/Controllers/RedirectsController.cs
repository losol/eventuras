using Microsoft.AspNetCore.Mvc;

namespace losol.EventManagement.Web.Controllers
{
    public class RedirectsController : Controller
    {

        [HttpGet("/Events/Details")]
        public IActionResult RedirectOldEventLinks([FromQuery]int id) => 
            RedirectToPage("/Events/Details", new { id = id });
    }
}