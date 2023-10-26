using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Certificates
{
    internal class CertificateRetrievalService : ICertificateRetrievalService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICertificateAccessControlService _certificateAccessControlService;

        public CertificateRetrievalService(
            ApplicationDbContext context,
            ICertificateAccessControlService certificateAccessControlService)
        {
            _context = context ?? throw
                new ArgumentNullException(nameof(context));

            _certificateAccessControlService = certificateAccessControlService ?? throw
                new ArgumentNullException(nameof(certificateAccessControlService));
        }

        public async Task<Certificate> GetCertificateByIdAsync(int id,
            CertificateRetrievalOptions options = default,
            CancellationToken cancellationToken = default)
        {
            options ??= new CertificateRetrievalOptions();

            var certificate = await _context.Certificates
                .WithOptions(options)
                .SingleOrDefaultAsync(c => c.CertificateId == id,
                    cancellationToken) ?? throw new NotFoundException($"Certificate {id} not found");

            if (options.ForUpdate)
            {
                await _certificateAccessControlService
                    .CheckCertificateUpdateAccessAsync(certificate, cancellationToken);
            }
            else
            {
                await _certificateAccessControlService
                    .CheckCertificateReadAccessAsync(certificate, cancellationToken);
            }

            return certificate;
        }

        public async Task<Paging<Certificate>> ListCertificatesAsync(
            CertificateListRequest request,
            CertificateRetrievalOptions options = default,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Certificates
                .WithOptions(options ?? new CertificateRetrievalOptions())
                .AddFilter(request.Filter, _context)
                .AddOrder(request.ListOrder, request.Descending);

            // TODO: add accessibility filter!

            return await Paging.CreateAsync(query, request, cancellationToken);
        }
    }
}
