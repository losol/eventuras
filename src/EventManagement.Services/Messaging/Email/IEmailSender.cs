using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Services.Messaging
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string message);
        Task SendEmailAsync(string email, string subject, string message, Attachment attachment);
    }

    public class Attachment
    {
        public string Filename { get; set; }
        public byte[] Bytes { get; set; }
    }
}
