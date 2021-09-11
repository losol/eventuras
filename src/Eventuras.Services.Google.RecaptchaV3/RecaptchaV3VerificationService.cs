using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;

namespace Eventuras.Services.Google.RecaptchaV3
{
    public class RecaptchaV3VerificationService : IRecaptchaV3VerificationService
    {
        private const string ApiUrl = "https://www.google.com/recaptcha/api/siteverify";

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IOptions<RecaptchaV3Config> _options;
        private readonly ILogger<RecaptchaV3VerificationService> _logger;

        public RecaptchaV3VerificationService(
            IHttpClientFactory httpClientFactory,
            IOptions<RecaptchaV3Config> options,
            ILogger<RecaptchaV3VerificationService> logger)
        {
            _httpClientFactory = httpClientFactory ?? throw
                new ArgumentNullException(nameof(httpClientFactory));

            _options = options ?? throw
                new ArgumentNullException(nameof(options));

            _logger = logger ?? throw
                new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> VerifyTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                throw new ArgumentNullException(nameof(token));
            }

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsync(ApiUrl,
                new FormUrlEncodedContent(
                    new KeyValuePair<string, string>[]
                    {
                        new("secret", _options.Value.ApiSecret),
                        new("response", token)
                    }));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Non-successful response returned by captcha verification API: {Code}",
                    response.StatusCode);

                var message = await response.Content.ReadAsStringAsync();
                _logger.LogDebug("Response message: {Message}", message);

                return false;
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JToken.Parse(content);
            if (!json.Any())
            {
                _logger.LogWarning("Invalid JSON returned by captcha verification API: {Content}", content);
                return false;
            }

            _logger.LogDebug("JSON returned: {Content}", content);
            return json.Value<bool>("success");
        }
    }
}
