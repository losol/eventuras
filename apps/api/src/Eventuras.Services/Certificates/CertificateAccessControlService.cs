using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Registrations;

namespace Eventuras.Services.Certificates;

internal class CertificateAccessControlService : ICertificateAccessControlService
{
    private readonly IRegistrationRetrievalService _registrationRetrievalService;
    private readonly IRegistrationAccessControlService _registrationAccessControlService;

    public CertificateAccessControlService(
        IRegistrationRetrievalService registrationRetrievalService,
        IRegistrationAccessControlService registrationAccessControlService)
    {
        _registrationRetrievalService = registrationRetrievalService ?? throw
            new ArgumentNullException(nameof(registrationRetrievalService));

        _registrationAccessControlService = registrationAccessControlService ?? throw
            new ArgumentNullException(nameof(registrationAccessControlService));
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

    public async Task CheckCertificatesReadAccessAsync(
        List<Certificate> certificates,
        CancellationToken cancellationToken = default)
    {
        if (certificates == null || certificates.Count == 0)
        {
            throw new InvalidOperationException("Certificates is null or empty");
        }

        foreach (var certificate in certificates)
        {
            await CheckCertificateReadAccessAsync(certificate, cancellationToken);
        }
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

    public async Task CheckCertificatesUpdateAccessAsync(
        List<Certificate> certificates,
        CancellationToken cancellationToken = default)
    {
        if (certificates == null || certificates.Count == 0)
        {
            throw new InvalidOperationException("Certificates is null or empty");
        }

        foreach (var certificate in certificates)
        {
            await CheckCertificateUpdateAccessAsync(certificate, cancellationToken);
        }
    }

    private async Task<Registration> GetRegistrationForCertificateAsync(
        Certificate certificate,
        CancellationToken cancellationToken)
    {
        return await _registrationRetrievalService
                   .FindRegistrationAsync(new RegistrationFilter
                   {
                       HavingCertificateOnly = true,
                       CertificateId = certificate.CertificateId,
                   }, cancellationToken: cancellationToken)
               ?? throw new NotFoundException(
                   $"Registration not found for certificate {certificate.CertificateId}");
    }
}
