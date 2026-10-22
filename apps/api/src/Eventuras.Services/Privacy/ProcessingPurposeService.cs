#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Organizations;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Privacy;

internal class ProcessingPurposeService : IProcessingPurposeService
{
    private readonly IOrganizationAccessControlService _accessControl;
    private readonly ApplicationDbContext _dbContext;

    public ProcessingPurposeService(
        ApplicationDbContext dbContext,
        IOrganizationAccessControlService accessControl)
    {
        ArgumentNullException.ThrowIfNull(dbContext);
        ArgumentNullException.ThrowIfNull(accessControl);

        _dbContext = dbContext;
        _accessControl = accessControl;
    }

    public async Task<IReadOnlyList<ProcessingPurpose>> ListCurrentAsync(
        Organization organization,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(organization);

        await _accessControl.CheckOrganizationReadAccessAsync(organization.OrganizationId);

        // At most one version per code is unretired, which a filtered unique index
        // enforces, so this is the current version of each purpose in use.
        return await _dbContext.ProcessingPurposes
            .AsNoTracking()
            .Where(p => p.OrganizationUuid == organization.Uuid && p.RetiredAt == null)
            .OrderBy(p => p.Code)
            .ToListAsync(cancellationToken);
    }
}
