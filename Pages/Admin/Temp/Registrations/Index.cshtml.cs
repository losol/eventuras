using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Data;
using losol.EventManagement.Models;

namespace losol.EventManagement.Pages.Admin.Temp.Registrations
{
    public class IndexModel : PageModel
    {
        private readonly losol.EventManagement.Data.ApplicationDbContext _context;

        public IndexModel(losol.EventManagement.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<Registration> Registration { get;set; }

        public async Task OnGetAsync()
        {
            Registration = await _context.Registrations
                .Include(r => r.EventInfo)
                .Include(r => r.PaymentMethod)
                .Include(r => r.User).ToListAsync();
        }
    }
}
