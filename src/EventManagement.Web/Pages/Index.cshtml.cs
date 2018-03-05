using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Data;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace losol.EventManagement.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public IndexModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<EventInfo> Events {get; set;}
        public List<EventInfo> FeaturedEvents {get; set;}

        public void OnGet()
        {
            Events = _context.EventInfos
                .Where(i => i.Published == true)
                .ToList();
            
            FeaturedEvents =  _context.EventInfos
                .Where(i => (i.Published == true) && (i.Featured == true))
                .ToList();

        }
    }
}
