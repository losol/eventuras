using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using System.ComponentModel.DataAnnotations;
using losol.EventManagement.Web.Services;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class MessagingModel : PageModel
    {
        private readonly IEventInfoService _eventinfos;

        public MessagingModel(
            IEventInfoService eventinfos)
        {
            _eventinfos = eventinfos;
        }

        public EventInfo EventInfo {get;set;}

        public async Task<IActionResult> OnGetAsync(int id)
        {
            EventInfo = await _eventinfos.GetAsync(id);
            return Page();
        }

    }
}

