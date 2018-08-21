using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace losol.EventManagement.Pages.Events.Participants
{
    [Authorize]
    public class POCModel : PageModel
    {
        public string Slug { get; private set; }
        public async Task<PageResult> OnGetAsync(string slug)
        {
            this.Slug = slug;
            await Task.FromResult(0);
            return Page();
        }
    }
}
