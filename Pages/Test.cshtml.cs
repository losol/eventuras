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
    public class TestTestModel : PageModel
    {
        private readonly ApplicationDbContext _context;
		private readonly IPageRenderService _pageRenderService;

        public TestTestModel(ApplicationDbContext context, IPageRenderService pageRenderService)
        {
            _context = context;
			_pageRenderService = pageRenderService;
        }


        public async Task OnGet()
        {
			Console.WriteLine("*********^^^^^^^^^^^^^^^^^^vvvvvvvvvvv");
			var viewModel = new Register.EventRegistrationModel.RegisterVM();
			var result = await _pageRenderService.RenderPageToStringAsync("Test", viewModel);
			Console.WriteLine(result);


        }
    }
}
