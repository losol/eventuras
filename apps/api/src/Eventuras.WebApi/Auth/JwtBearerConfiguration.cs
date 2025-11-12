using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Eventuras.WebApi.Auth;

public static class JwtBearerConfiguration
{
    public static AuthenticationBuilder AddJwtBearerConfiguration(this AuthenticationBuilder builder, string issuer,
        string audience, string jwtSecret) =>
        builder.AddJwtBearer(options =>
        {
            options.Authority = issuer;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidAudiences = new List<string> { audience, issuer.TrimEnd('/') + "/userinfo" }
            };

            options.Events = new JwtBearerEvents
            {
                OnChallenge = context =>
                {
                    context.HandleResponse();
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";

                    // Ensure we always have an error and error description.
                    if (string.IsNullOrEmpty(context.Error))
                    {
                        context.Error = "invalid_token";
                    }

                    if (string.IsNullOrEmpty(context.ErrorDescription))
                    {
                        context.ErrorDescription = "This request requires a valid JWT access token to be provided";
                    }

                    // Add some extra context for expired tokens.
                    if (context.AuthenticateFailure != null && context.AuthenticateFailure.GetType() ==
                        typeof(SecurityTokenExpiredException))
                    {
                        var authenticationException = context.AuthenticateFailure as SecurityTokenExpiredException;
                        context.Response.Headers.Append("x-token-expired",
                            authenticationException.Expires.ToString("o"));
                        context.ErrorDescription =
                            $"The token expired on {authenticationException.Expires.ToString("o")}";
                    }

                    return context.Response.WriteAsync(JsonSerializer.Serialize(new
                    {
                        error = context.Error,
                        error_description = context.ErrorDescription
                    }));
                }
            };
        });
}
