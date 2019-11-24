using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Losol.Communication.Email.Services.Render;
using Losol.Communication.Email.Views.Emails.ConfirmAccount;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace CommunicationApp.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IRazorViewToStringService _viewrender;


        public IndexModel(ILogger<IndexModel> logger, IRazorViewToStringService viewrender)
        {
            _viewrender = viewrender;
            _logger = logger;
        }

        public async void OnGet()
        {
            var confirmAccountModel = new ConfirmAccountEmailViewModel()
            {
                ConfirmEmailUrl = "https://test"
            };

            var email = await _viewrender.RenderViewToStringAsync("/Views/Emails/ConfirmAccount.cshtml", confirmAccountModel);
            _logger.LogCritical(email);

        }
    }
}
