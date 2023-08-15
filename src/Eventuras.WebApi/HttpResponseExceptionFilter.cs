#nullable enable

using System;
using System.Collections.Generic;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Eventuras.WebApi;

public class HttpResponseExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var ex = context.Exception;
        var result = (IActionResult?)(ex switch
        {
            NotFoundException => new NotFoundObjectResult(ex.Message),
            InputException => new BadRequestObjectResult(ex.Message),
            NotSupportedException => new BadRequestObjectResult(ex.Message),
            NotAccessibleException => new ForbidResult(),
            OrgNotSpecifiedException => new BadRequestObjectResult(ex.Message),
            DuplicateException => new ConflictObjectResult(ex.Message),
            ArgumentServiceException argEx => new BadRequestObjectResult(CreateBadRequestModel(argEx.Message, argEx.ParamName)),
            InvalidOperationServiceException invEx => new BadRequestObjectResult(CreateBadRequestModel(invEx.Message)),
            _ => null,
        });

        if (result == null)
        {
            context.ExceptionHandled = false;
            return;
        }

        context.Result = result;
        context.ExceptionHandled = true;
    }

    private static ValidationProblemDetails CreateBadRequestModel(string message, string? paramName = null)
    {
        return new ValidationProblemDetails(new Dictionary<string, string[]>
        {
            [paramName ?? string.Empty] = new[] { message },
        });
    }
}