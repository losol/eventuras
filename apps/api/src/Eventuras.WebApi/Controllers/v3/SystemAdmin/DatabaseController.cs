using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.WebApi.Controllers.v3.SystemAdmin;

[ApiVersion("3")]
[Route("v{version:apiVersion}/system/database")]
[ApiController]
[Authorize(Roles = Roles.Admin)]
public class DatabaseController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var appliedMigrations = await context.Database
            .GetAppliedMigrationsAsync(cancellationToken);

        var pendingMigrations = await context.Database
            .GetPendingMigrationsAsync(cancellationToken);

        var lastApplied = appliedMigrations.LastOrDefault();

        return Ok(new
        {
            connected = await context.Database.CanConnectAsync(cancellationToken),
            lastAppliedMigration = lastApplied,
            appliedMigrationsCount = appliedMigrations.Count(),
            pendingMigrations = pendingMigrations.ToList(),
            hasPendingMigrations = pendingMigrations.Any(),
        });
    }
}
