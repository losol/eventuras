using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;

namespace Eventuras.Services.Certificates;
internal class CertificateManagementService : ICertificateManagementService
{
    private readonly ApplicationDbContext _context;

    public CertificateManagementService(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task UpdateCertificateAsync(Certificate certificate)
    {
        if (certificate == null)
        {
            throw new ArgumentNullException(nameof(certificate));
        }

        await _context.UpdateAsync(certificate);
    }
}
