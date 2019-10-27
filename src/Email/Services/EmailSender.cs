using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Losol.Communication.Email.Services
{
    public class EmailSender : IEmailSender
    {
        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            throw new NotImplementedException();
        }
    }
}