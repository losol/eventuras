using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Losol.Communication.Email.Services;
using Microsoft.Extensions.Options;

namespace Losol.Communication.Email.File
{
    /// <summary>
    /// Writes an email to a file instead of actually sending it.
    /// This implementation is not designed to be used in production.
    /// </summary>
    public class FileEmailWriter : IEmailSender
    {
        private readonly IOptions<FileEmailConfig> _options;

        public FileEmailWriter(IOptions<FileEmailConfig> options)
        {
            _options = options;
            if (!Directory.Exists(options.Value.FilePath))
            {
                Directory.CreateDirectory(options.Value.FilePath);
            }
        }

        public async Task SendEmailAsync(
            string address,
            string subject,
            string message,
            Attachment attachment = null,
            EmailMessageType messageType = EmailMessageType.Html)
        {
            // filename: {datetime}-{email}-{subject}.html
            var filename = $"{DateTime.UtcNow:u}-{address.GenerateSlug()}-{subject.GenerateSlug()}.html";

            // Write the message to the file
            await using var outputFile = new StreamWriter(Path.Combine(_options.Value.FilePath, filename));
            await outputFile.WriteLineAsync(message);
        }
    }

    // Code borrowed from: https://stackoverflow.com/a/2921135
    internal static class StringExtensions
    {
        internal static string GenerateSlug(this string phrase)
        {
            var str = phrase.RemoveAccent().ToLower();
            // invalid chars           
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            // convert multiple spaces into one space   
            str = Regex.Replace(str, @"\s+", " ").Trim();
            // cut and trim 
            str = str.Substring(0, str.Length <= 45 ? str.Length : 45).Trim();
            str = Regex.Replace(str, @"\s", "-"); // hyphens   
            return str;
        }

        // Not the best way to do it
        // but it's only used on a dev environment,
        // so leaving it as is.
        internal static string RemoveAccent(this string txt)
        {
            var bytes = System.Text.Encoding.GetEncoding("Cyrillic").GetBytes(txt);
            return System.Text.Encoding.ASCII.GetString(bytes);
        }
    }
}
