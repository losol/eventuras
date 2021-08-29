using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Registrations
{
    internal class RegistrationOrderManagementService : IRegistrationOrderManagementService
    {
        private readonly IRegistrationAccessControlService _registrationAccessControlService;
        private readonly ApplicationDbContext _context;

        public RegistrationOrderManagementService(
            IRegistrationAccessControlService registrationAccessControlService,
            ApplicationDbContext context)
        {
            _registrationAccessControlService = registrationAccessControlService ?? throw
                new ArgumentNullException(nameof(registrationAccessControlService));

            _context = context ?? throw
                new ArgumentNullException(nameof(context));
        }

        public async Task<Order> CreateOrderForRegistrationAsync(
            Registration registration,
            OrderItemDto[] data,
            CancellationToken cancellationToken)
        {
            await _registrationAccessControlService
                .CheckRegistrationUpdateAccessAsync(registration, cancellationToken);

            data ??= Array.Empty<OrderItemDto>();

            var productIds = data.Select(o => o.ProductId).ToArray();
            var variantIds = data.Select(o => o.VariantId).ToArray();

            var productMap = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .ToDictionaryAsync(p => p.ProductId, cancellationToken);

            var variantMap = await _context.ProductVariants
                .Where(v => variantIds.Contains(v.ProductVariantId))
                .ToDictionaryAsync(v => v.ProductVariantId, cancellationToken);

            var lines = data.Select(o => new OrderDTO
            {
                Product = productMap[o.ProductId],
                Variant = o.VariantId.HasValue ? variantMap[o.VariantId.Value] : null,
                Quantity = o.Quantity
            });

            var order = registration.CreateOrder(lines);
            await _context.UpdateAsync(registration, cancellationToken);
            return order;
        }
    }
}
