using Eventuras.Services.Auth;
using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Registrations
{
    // FIXME: it's better to use GraphQL for splitting updates and checking the rules
    // FIXME: for the various parts of the data model (like, admin can edit this, and that,
    // FIXME: but simple users can't).

    public class RegistrationFormAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var httpContext = ((IHttpContextAccessor)validationContext.GetService(typeof(IHttpContextAccessor)))?.HttpContext;
            if (httpContext == null)
            {
                throw new NullReferenceException("IHttpContextAccessor not configured");
            }

            if (!(value is RegistrationFormDto dto))
            {
                throw new NullReferenceException("RegistrationFormAttribute is applicable for RegistrationFormDto only");
            }

            var user = httpContext.User;
            if (user.IsAdmin())
            {
                return ValidationResult.Success;
            }

            if (dto.Customer != null)
            {
                return new ValidationResult("Customer information can be managed by admins only");
            }

            if (dto.Notes != null)
            {
                return new ValidationResult("Registration notes can be updated by admins only");
            }

            if (dto.Type != null)
            {
                return new ValidationResult("Registration type can be updated by admins only");
            }

            if (dto.PaymentMethod != null)
            {
                return new ValidationResult("Registration payment method can be updated by admins only");
            }

            return ValidationResult.Success;
        }
    }
}
