using System;
using System.IO;
using System.Linq;
using System.Reflection;
using Asp.Versioning.ApiExplorer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using NodaTime;
using Swashbuckle.AspNetCore.SwaggerGen;

public class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider provider;

    public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider) =>
        this.provider = provider;

    public void Configure(SwaggerGenOptions options)
    {
        options.EnableAnnotations();

        foreach (var description in provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(
                description.GroupName,
                new OpenApiInfo
                {
                    Title = $"Eventuras API {description.ApiVersion}",
                    Version = description.ApiVersion.ToString()
                });
        }

        // Set host name
        options.AddServer(new OpenApiServer { Url = "https://localhost:5001", Description = "Dev server (HTTPS)" });

        options.AddServer(new OpenApiServer { Url = "http://localhost:5000", Description = "Dev server (HTTP)" });


        // Add JWT Authentication
        options.AddSecurityDefinition("Bearer",
            new OpenApiSecurityScheme
            {
                Description =
                    "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer"
            });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });

        // Removes json patch, as the typescript generator does not support it
        options.OperationFilter<RemoveJsonPatchContentTypeFilter>();

        // Add header parameters
        options.OperationFilter<ApiHeaderParameters>();

        options.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());

        // Ensure LocalDate is treated as a string with "date" format
        options.MapType<LocalDate>(() => new OpenApiSchema { Type = "string", Format = "date" });

        var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    }
}

public class RemoveJsonPatchContentTypeFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var contentTypesToRemove = new[] { "application/json-patch+json" };

        // Remove the content type from request body
        if (operation.RequestBody != null)
        {
            foreach (var contentType in contentTypesToRemove)
            {
                operation.RequestBody.Content.Remove(contentType);
            }
        }

        // Remove the content type from responses
        foreach (var response in operation.Responses)
        {
            foreach (var contentType in contentTypesToRemove)
            {
                response.Value.Content.Remove(contentType);
            }
        }
    }
}
