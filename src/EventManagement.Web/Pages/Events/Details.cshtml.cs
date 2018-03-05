using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;

namespace losol.EventManagement.Pages.Events
{
    public class DetailsModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public DetailsModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public EventInfo EventInfo { get; set; }
        public bool HasFeaturedImage {get;set;} = false;
        public string Message {get;set;} ="asdf";

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            EventInfo = await _context.EventInfos.SingleOrDefaultAsync(m => m.EventInfoId == id);

            if (EventInfo == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(EventInfo.FeaturedImageUrl)) {
                HasFeaturedImage = true;
                Message += ".has featured";
            }
            else
            {
                HasFeaturedImage = false;
            }
            
            return Page();
        }
    }
}
