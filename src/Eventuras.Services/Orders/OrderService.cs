using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Invoicing;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static Eventuras.Domain.Order;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.Orders
{
    internal class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _db;
        private readonly IPowerOfficeService _powerOfficeService;
        private readonly IStripeInvoiceService _stripeInvoiceService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly ILogger _logger;

        public OrderService(
            ApplicationDbContext db,
            IPowerOfficeService powerOfficeService,
            IStripeInvoiceService stripeInvoiceService,
            ILogger<OrderService> logger,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _powerOfficeService = powerOfficeService;
            _stripeInvoiceService = stripeInvoiceService;
            _logger = logger;
            _currentOrganizationAccessorService = currentOrganizationAccessorService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<Order>> GetAsync() =>
            await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
            .OrderByDescending(o => o.OrderTime)
            .ToListAsync();

        public async Task<List<Order>> GetWithRegistrationsAsync() =>
            await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
            .Include(o => o.Registration)
            .ThenInclude(r => r.User)
            .OrderByDescending(o => o.OrderTime)
            .ToListAsync();

        public async Task<List<Order>> GetAsync(int count, int offset) =>
            await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
            .Skip(offset)
            .Take(count)
            .OrderByDescending(o => o.OrderTime)
            .ToListAsync();

        public async Task<List<Order>> GetAsync(int count) => await GetAsync(count, 0);

        public async Task<Order> GetByIdAsync(int orderId) =>
            await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
            .Where(o => o.OrderId == orderId)
            .Include(o => o.OrderLines)
            .Include(o => o.User)
            .Include(o => o.Registration)
            .ThenInclude(r => r.EventInfo)
            .SingleOrDefaultAsync();

        public async Task<List<Order>> GetOrdersForEventAsync(int eventId) =>
            await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
            .Include(o => o.OrderLines)
            .Include(o => o.Registration)
            .Where(o => o.Registration.EventInfoId == eventId)
            .OrderBy(o => o.Registration.ParticipantName)
            .AsNoTracking()
            .ToListAsync();

        public async Task<int> DeleteOrderAsync(Order order)
        {
            if (order.Status == OrderStatus.Invoiced)
            {
                throw new InvalidOperationException("Invoiced orders cannot be deleted.");
            }

            await CheckOrderAccessibilityAsync(order.OrderId);

            _db.Orders.Remove(order);
            return await _db.SaveChangesAsync();
        }
        public async Task<int> DeleteOrderAsync(int orderId)
        {
            var order = await CheckOrderAccessibilityAsync(orderId);
            return await DeleteOrderAsync(order);
        }

        public Task<OrderLine> GetOrderLineAsync(int lineId) =>
            _db.OrderLines
            .Where(l => l.OrderLineId == lineId)
            .Include(l => l.Order)
            .SingleOrDefaultAsync();

        public async Task<bool> DeleteOrderLineAsync(int lineId)
        {
            var line = await GetOrderLineAsync(lineId);
            if (line == null)
            {
                throw new ArgumentException("Invalid lineId", nameof(lineId));
            }

            if (!line.Order.CanEdit)
            {
                throw new InvalidOperationException("The order line cannot be edited anymore.");
            }

            _db.OrderLines.Remove(line);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> AddOrderLineAsync(int orderId, int productId, int? variantId)
        {
            var order = await _db.Orders.FindAsync(orderId);
            var product = await _db.Products.FindAsync(productId);
            var variant = variantId.HasValue ? await _db.ProductVariants.FindAsync(variantId) : null;

            _ = order ??
                throw new ArgumentException("Invalid orderId", nameof(orderId));
            _ = product ??
                throw new ArgumentException("Invalid productId", nameof(productId));

            var line = new OrderLine
            {
                OrderId = orderId,
                ProductId = productId,
                ProductVariantId = variantId,

                Price = variant?.Price ?? product.Price,
                VatPercent = variant?.VatPercent ?? product.VatPercent,
                Quantity = product.MinimumQuantity,

                ProductName = product.Name,
                ProductDescription = product.Description,
                ProductVariantName = variant?.Name,
                ProductVariantDescription = variant?.Description
            };
            await _db.OrderLines.AddAsync(line);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateOrderLine(int lineId, int? variantId, int quantity, decimal price)
        {
            var line = await _db.OrderLines.FindAsync(lineId);
            _ = line ??
                throw new ArgumentException("Invalid lineId", nameof(lineId));

            line.Quantity = quantity;
            line.Price = price;

            line.ProductVariantId = variantId;
            if (variantId != null)
            {
                var variant = await _db.ProductVariants
                                    .AsNoTracking()
                                    .SingleOrDefaultAsync(v => v.ProductVariantId == variantId);
                line.ProductVariantName = variant.Name;
                line.ProductVariantDescription = variant.Description;
            }

            _db.Update(line);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateOrderDetailsAsync(int id, string customername, string customerEmail, string invoiceReference, string comments)
        {
            var order = await CheckOrderAccessibilityAsync(id);

            order.CustomerName = customername;
            order.CustomerEmail = customerEmail;
            order.CustomerInvoiceReference = invoiceReference;
            order.Comments = comments;

            _db.Orders.Update(order);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateOrderComment(int id, string comments)
        {
            var order = await CheckOrderAccessibilityAsync(id);
            order.Comments = comments;
            _db.Orders.Update(order);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<int> MakeOrderFreeAsync(int id)
        {
            var order = await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
                .Include(o => o.OrderLines)
                .SingleOrDefaultAsync(o => o.OrderId == id);
            order.OrderLines.ForEach((l) => l.Price = 0);
            return await _db.SaveChangesAsync();
        }

        public async Task<bool> MarkAsVerifiedAsync(int orderId)
        {
            var order = await CheckOrderAccessibilityAsync(orderId);
            order.MarkAsVerified();
            _db.Orders.Update(order);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> MarkAsCancelledAsync(int orderId)
        {
            var order = await CheckOrderAccessibilityAsync(orderId);
            order.MarkAsCancelled();
            _db.Orders.Update(order);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> CreateInvoiceAsync(int orderId)
        {
            var order = await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
                .Include(o => o.OrderLines)
                .Include(o => o.User)
                .Include(o => o.Registration)
                .ThenInclude(r => r.EventInfo)
                .SingleOrDefaultAsync(o => o.OrderId == orderId);

            _logger.LogInformation($"Making invoice for order: {order.OrderId}, paymenmethod: {order.PaymentMethod}");

            bool invoiceCreated = false;

            if (order.PaymentMethod == PaymentProvider.PowerOfficeEHFInvoice || order.PaymentMethod == PaymentProvider.PowerOfficeEmailInvoice)
            {
                _logger.LogInformation("* Using PowerOffice for invoicing");
                invoiceCreated = await _powerOfficeService.CreateInvoiceAsync(order);
            }
            else if (order.PaymentMethod == PaymentProvider.StripeInvoice)
            {
                _logger.LogInformation("* Using StripeInvoice for invoicing");
                invoiceCreated = await _stripeInvoiceService.CreateInvoiceAsync(order);
            }

            if (invoiceCreated)
            {
                order.MarkAsInvoiced();
                _db.Orders.Update(order);
                await _db.SaveChangesAsync();
            }
            return invoiceCreated;
        }

        public async Task<bool> UpdatePaymentMethod(int orderId, PaymentProvider paymentMethod)
        {
            var order = await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
                .Where(m => m.OrderId == orderId)
                .FirstOrDefaultAsync();

            // Update payment method in registration.
            order.PaymentMethod = paymentMethod;
            _db.Update(order);

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> AddLogLineAsync(int orderId, string logText)
        {
            var order = await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
                .Where(m => m.OrderId == orderId).SingleOrDefaultAsync();
            order.AddLog(logText);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<Order> CreateDraftFromCancelledOrder(int orderId)
        {
            var order = await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
                                .Include(o => o.Registration)
                                    .ThenInclude(r => r.Orders)
                                        .ThenInclude(o => o.OrderLines)
                                .Include(o => o.OrderLines)
                                .AsNoTracking()
                                .SingleOrDefaultAsync(o => o.OrderId == orderId);

            var newOrder = new Order
            {
                PaymentMethod = order.PaymentMethod,
                RegistrationId = order.RegistrationId,
                Comments = order.Comments,
                CustomerEmail = order.CustomerEmail,
                CustomerInvoiceReference = order.CustomerInvoiceReference,
                CustomerName = order.CustomerName,
                CustomerVatNumber = order.CustomerVatNumber,
                UserId = order.UserId,
                OrderLines = order.OrderLines.Select(l => { l.OrderLineId = 0; return l; }).ToList()
            };
            newOrder.AddLog($"New order created from cancelled order: #{order.OrderId}");

            var existingProductIds = order.Registration.Orders.Where(o => o.Status != OrderStatus.Cancelled)
                                            .SelectMany(o => o.OrderLines
                                            .Where(l => l.ProductId.HasValue)
                                            .Select(l => l.ProductId.Value)
                                        );
            if (existingProductIds.Intersect(newOrder.OrderLines.Where(l => l.ProductId.HasValue).Select(l => l.ProductId.Value)).Any())
            {
                throw new InvalidOperationException("Cannot recreate order because some of the products were already ordered.");
            }

            await _db.AddAsync(newOrder);
            await _db.SaveChangesAsync();
            return newOrder;
        }

        private async Task<IQueryable<Order>> AddCurrentOrgFilterForAdminAsync(IQueryable<Order> query)
        {
            var principal = _httpContextAccessor.HttpContext.User;
            if (principal.IsInRole(Roles.SuperAdmin))
            {
                return query;
            }
            if (principal.Identity.IsAuthenticated)
            {
                var organization = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync();
                return organization?.IsRoot == true
                    ? query : query.HavingOrganization(organization);
            }
            else
            {
                var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
                return query.HavingNoOrganizationOr(organization);
            }
        }

        private async Task<Order> CheckOrderAccessibilityAsync(int orderId)
        {
            var order = await (await AddCurrentOrgFilterForAdminAsync(_db.Orders))
                .SingleOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new InvalidOperationException($"Order {orderId} doesn't exist or not accessible");
            }

            return order;
        }
    }
}
