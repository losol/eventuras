using System;
using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Auth;
using Microsoft.AspNetCore.Http;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

public class RegistrationFormAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        var httpContext = ((IHttpContextAccessor)validationContext.GetService(typeof(IHttpContextAccessor)))
            ?.HttpContext;
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


        return ValidationResult.Success;
    }
}
