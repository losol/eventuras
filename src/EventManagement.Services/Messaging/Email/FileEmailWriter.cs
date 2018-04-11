using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace losol.EventManagement.Services.Messaging
{
	/// <summary>
	/// Writes an email to a file instead of actually sending it.
	/// This implementation is not designed to be used in production.
	/// </summary>
	public class FileEmailWriter : IEmailSender
	{
		private readonly IHostingEnvironment _environment;
		private readonly string filePath;

		public FileEmailWriter(IHostingEnvironment environment)
		{
			_environment = environment;
			filePath = Path.Combine(_environment.ContentRootPath, "emails");
			if(!Directory.Exists(filePath))
			{
				Directory.CreateDirectory(filePath);
			}
		}

		public async Task SendEmailAsync(string email, string subject, string message)
		{
			// filename: {datetime}-{email}-{subject}.html
			string filename = $"{DateTime.UtcNow.ToString("u")}-{email.GenerateSlug()}-{subject.GenerateSlug()}.html";

			// Write the message to the file
			using (StreamWriter outputFile = new StreamWriter(Path.Combine(filePath, filename)))
			{
				await outputFile.WriteLineAsync(message);
			}
		}

        public Task SendEmailAsync(string email, string subject, string message, Attachment attachment)
        {
            throw new NotImplementedException();
        }
    }

	// Code borrowed from: https://stackoverflow.com/a/2921135
	internal static class StringExtensions
	{
		internal static string GenerateSlug(this string phrase)
		{
			string str = phrase.RemoveAccent().ToLower();
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
			byte[] bytes = System.Text.Encoding.GetEncoding("Cyrillic").GetBytes(txt);
			return System.Text.Encoding.ASCII.GetString(bytes);
		}
	}
}
