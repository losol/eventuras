using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Eventuras.Infrastructure;

namespace Eventuras.Pages.Admin.Users
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;


        public IndexModel(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager
            )

        {
            _context = context;
            _userManager = userManager;
        }

        public List<ApplicationUser> Users { get; set; }

        public async Task OnGetAsync()
        {
            var users = await _userManager.Users.ToListAsync();
        }
    }
}
