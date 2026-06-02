using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Http;

namespace Eventuras.Services.Certificates;

internal class CertificateAccessControlService : ICertificateAccessControlService
{
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IRegistrationAccessControlService _registrationAccessControlService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public CertificateAccessControlService(
        IRegistrationRetrievalService registrationRetrievalService,
        IRegistrationAccessControlService registrationAccessControlService,
        IHttpContextAccessor httpContextAccessor,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService)
    {
        _registrationRetrievalService = registrationRetrievalService ?? throw
            new ArgumentNullException(nameof(registrationRetrievalService));

        _registrationAccessControlService = registrationAccessControlService ?? throw
            new ArgumentNullException(nameof(registrationAccessControlService));

        _httpContextAccessor = httpContextAccessor ?? throw
            new ArgumentNullException(nameof(httpContextAccessor));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));
    }

    public async Task CheckCertificateReadAccessAsync(
        Certificate certificate,
        CancellationToken cancellationToken)
    {
        if (certificate == null)
        {
            throw new ArgumentNullException(nameof(certificate));
        }

        var reg = await GetRegistrationForCertificateAsync(certificate, cancellationToken);

        await _registrationAccessControlService
            .CheckRegistrationReadAccessAsync(reg, cancellationToken);
    }

    public async Task CheckCertificateUpdateAccessAsync(
        Certificate certificate,
        CancellationToken cancellationToken = default)
    {
        if (certificate == null)
        {
            throw new ArgumentNullException(nameof(certificate));
        }

        var reg = await GetRegistrationForCertificateAsync(certificate, cancellationToken);

        await _registrationAccessControlService
            .CheckRegistrationUpdateAccessAsync(reg, cancellationToken);
    }

    public async Task<IQueryable<Certificate>> AddAccessFilterAsync(
        IQueryable<Certificate> query,
        CancellationToken cancellationToken = default)
    {
        var httpContext = _httpContextAccessor.HttpContext
            ?? throw new InvalidOperationException(
                "AddAccessFilterAsync requires an active HTTP context and cannot be called from background tasks or non-HTTP contexts.");

        var user = httpContext.User;

        if (user.IsAnonymous())
        {
            throw new NotAccessibleException("Anonymous users are not permitted to list certificates.");
        }

        if (user.IsSystemAdmin())
        {
            return query;
        }

        if (!user.IsAdmin())
        {
            // Regular users can only see their own certificates
            return query.Where(c => c.RecipientUserId == user.GetUserId());
        }

        // Admins can see certificates for their organization
        var org = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(null, cancellationToken);

        return query.Where(c => c.IssuingOrganizationId == org.OrganizationId);
    }

    private async Task<Registration> GetRegistrationForCertificateAsync(
        Certificate certificate,
        CancellationToken cancellationToken) =>
        await _registrationRetrievalService
            .FindRegistrationAsync(
                new RegistrationFilter { HavingCertificateOnly = true, CertificateId = certificate.CertificateId },
                cancellationToken: cancellationToken)
        ?? throw new NotFoundException(
            $"Registration not found for certificate {certificate.CertificateId}");
}
