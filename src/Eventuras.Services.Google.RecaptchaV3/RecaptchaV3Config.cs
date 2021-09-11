using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Google.RecaptchaV3
{
    public class RecaptchaV3Config
    {
        public bool Enabled { get; set; }

        [Required] public string ApiSecret { get; set; }

        /// <summary>
        /// Optional site key to be used for Recaptcha page rendering
        /// (and this generating the captcha response token).
        /// </summary>
        public string SiteKey { get; set; }
    }
}
