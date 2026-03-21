using System;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3;

[ApiVersion("3")]
[Route("v{version:apiVersion}/diagnostics")]
[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
public class DiagnosticsController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("version")]
    public IActionResult Version()
    {
        return Ok(new
        {
            version = Environment.GetEnvironmentVariable("BUILD_VERSION") ?? "dev",
            sha = Environment.GetEnvironmentVariable("BUILD_SHA") ?? "unknown",
        });
    }

    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [HttpPost("error-test")]
    public IActionResult ErrorTest()
    {
        throw new InvalidOperationException("Test exception from diagnostics endpoint");
    }
}
