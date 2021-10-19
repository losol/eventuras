using System;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Organizations.Settings
{
    /// <summary>
    /// Allows to bypass validation when the whole org settings section is not enabled,
    /// like for example when SendGrid, or Twilio account is not configured for the
    /// specific org. See <see cref="IConfigurableSettings"/>.
    /// </summary>
    public class ConfigurableSettingsValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value is not IConfigurableSettings settings)
            {
                throw new InvalidOperationException(
                    $"Class annotated with {nameof(ConfigurableSettingsValidationAttribute)}" +
                    $" must implement {nameof(IConfigurableSettings)}");
            }

            return settings.Enabled != true
                ? ValidationResult.Success
                : base.IsValid(value, validationContext);
        }
    }
}
