using System.Collections.Generic;
using Eventuras.Services.Constants;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

public class ApiHeaderParameters : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        operation.Parameters ??= new List<IOpenApiParameter>();

        operation.Parameters.Add(new OpenApiParameter
        {
            Name = Api.OrganizationHeader,
            In = ParameterLocation.Header,
            Required = false,
            Schema = new OpenApiSchema { Type = JsonSchemaType.Integer, Format = "int32" },
            Description = "Optional organization Id. Will be required in API version 4."
        });
    }
}
