using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Data;
using losol.EventManagement.Models;
using System.Globalization;

namespace losol.EventManagement.Pages.Events
{
    public class IndexModel : PageModel
    {
        private readonly losol.EventManagement.Data.ApplicationDbContext _context;

        public IndexModel(losol.EventManagement.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<EventInfo> OnDemandList { get;set; }
        public IList<EventInfo> EventList { get;set; }

        public async Task OnGetAsync()
        {
            EventList = await _context.EventInfos
                .Where(a => a.DateStart >= DateTime.Now)
                .OrderByDescending(a => a.DateStart)
                .ToListAsync();

            OnDemandList = await _context.EventInfos
                .Where(a => a.OnDemand == true)
                .ToListAsync();
        }
        
    }
}
