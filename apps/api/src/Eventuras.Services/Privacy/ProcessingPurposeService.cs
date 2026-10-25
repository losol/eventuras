#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Privacy;

internal class ProcessingPurposeService : IProcessingPurposeService
{
    private readonly IOrganizationAccessControlService _accessControl;
    private readonly ApplicationDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProcessingPurposeService(
        ApplicationDbContext dbContext,
        IOrganizationAccessControlService accessControl,
        IHttpContextAccessor httpContextAccessor)
    {
        ArgumentNullException.ThrowIfNull(dbContext);
        ArgumentNullException.ThrowIfNull(accessControl);
        ArgumentNullException.ThrowIfNull(httpContextAccessor);

        _dbContext = dbContext;
        _accessControl = accessControl;
        _httpContextAccessor = httpContextAccessor;
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

    public async Task<ProcessingPurpose> CreateAsync(
        Organization organization,
        NewProcessingPurpose purpose,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(organization);
        ArgumentNullException.ThrowIfNull(purpose);

        // Purpose texts are what users are shown and decide on, so defining one is a
        // platform decision rather than something each organization admin does.
        var user = _httpContextAccessor.HttpContext?.User;
        if (user is null || !user.IsSystemAdmin())
        {
            throw new NotAccessibleException("Only a system admin can create processing purposes.");
        }

        // Mirrors the check constraint, so the caller gets a 400 instead of a database error.
        if (purpose.HasSpecialCategoryData && purpose.Kind != ProcessingPurpose.PurposeKind.Consent)
        {
            throw new ArgumentServiceException(
                "A purpose covering special category data must be a consent; "
                + "a reservation is not a valid basis for it.",
                nameof(purpose.Kind));
        }

        // Any version counts, retired ones included: reusing a code would make earlier
        // decisions on it read as answers to a different purpose.
        var exists = await _dbContext.ProcessingPurposes
            .AnyAsync(p => p.OrganizationUuid == organization.Uuid && p.Code == purpose.Code, cancellationToken);
        if (exists)
        {
            throw new DuplicateException(
                $"The organization already has a purpose with code '{purpose.Code}'.");
        }

        var entity = new ProcessingPurpose
        {
            OrganizationUuid = organization.Uuid,
            Code = purpose.Code,
            Version = 1,
            Kind = purpose.Kind,
            Name = purpose.Name,
            Text = purpose.Text,
            HasSpecialCategoryData = purpose.HasSpecialCategoryData,
            Scope = purpose.Scope
        };

        _dbContext.ProcessingPurposes.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return entity;
    }
}
