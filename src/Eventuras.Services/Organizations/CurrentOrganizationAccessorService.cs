using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations
{
    internal class CurrentOrganizationAccessorService : ICurrentOrganizationAccessorService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentOrganizationAccessorService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public async Task<Organization> GetCurrentOrganizationAsync()
        {
            var host = _httpContextAccessor.HttpContext.Request.Host;
            if (!host.HasValue)
            {
                return null;
            }
            return await _context.Organizations
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.EventurasHostname == host.Value);
        }
    }
}
