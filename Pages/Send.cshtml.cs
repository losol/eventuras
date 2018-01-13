using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Data;
using losol.EventManagement.Models;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace losol.EventManagement.Pages
{
    public class SendTestModel : PageModel
    {
        private readonly ApplicationDbContext _context;
		private readonly IPageRenderService _pageRenderService;

        public SendTestModel(ApplicationDbContext context, IPageRenderService pageRenderService)
        {
            _context = context;
			_pageRenderService = pageRenderService;
        }


        public async Task OnGet()
        {
			Console.WriteLine("*********^^^^^^^^^^^^^^^^^^vvvvvvvvvvv");
			var viewModel = new IndexModel(_context);
			var result = await _pageRenderService.RenderPageToStringAsync("Index", viewModel);
			Console.WriteLine(result);

        }
    }
}
