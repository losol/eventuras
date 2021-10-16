using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Smtp
{
    public class OrganizationSmtpSettingsValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var settings = value as OrganizationSmtpSettings;
            return settings?.Enabled != true
                ? ValidationResult.Success
                : base.IsValid(value, validationContext);
        }
    }
}
