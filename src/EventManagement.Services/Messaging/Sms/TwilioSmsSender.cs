using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace losol.EventManagement.Services.Messaging.Sms
{
	public class TwilioSmsSender : ISmsSender
	{
		private readonly TwilioOptions _options;
		public TwilioSmsSender(IOptions<TwilioOptions> options)
		{
			_options = options.Value;
			TwilioClient.Init(_options.Sid, _options.AuthToken);
		}

		public async Task SendSmsAsync(string to, string body)
		{
			await MessageResource.CreateAsync(
				new PhoneNumber(to),
				from: new PhoneNumber(_options.From),
				body: body
			);
		}
	}
}
