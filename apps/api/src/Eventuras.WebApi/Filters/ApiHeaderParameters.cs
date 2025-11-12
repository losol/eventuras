using System.Collections.Generic;
using Eventuras.Services.Constants;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public class ApiHeaderParameters : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (operation.Parameters == null)
        {
            operation.Parameters = new List<OpenApiParameter>();
        }

        operation.Parameters.Add(new OpenApiParameter
        {
            Name = Api.OrganizationHeader,
            In = ParameterLocation.Header,
            Required = false,
            Schema = new OpenApiSchema { Type = "integer", Format = "int32" },
            Description = "Optional organization Id. Will be required in API version 4."
        });
    }
}
