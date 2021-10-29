using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.EventCollections;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Registrations
{
    internal class RegistrationOrderManagementService : IRegistrationOrderManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IRegistrationAccessControlService _registrationAccessControlService;
        private readonly IEventCollectionRetrievalService _eventCollectionRetrievalService;

        public RegistrationOrderManagementService(
            ApplicationDbContext context,
            IRegistrationRetrievalService registrationRetrievalService,
            IRegistrationAccessControlService registrationAccessControlService,
            IEventCollectionRetrievalService eventCollectionRetrievalService)
        {
            _context = context ?? throw
                new ArgumentNullException(nameof(context));

            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _registrationAccessControlService = registrationAccessControlService ?? throw
                new ArgumentNullException(nameof(registrationAccessControlService));

            _eventCollectionRetrievalService = eventCollectionRetrievalService ?? throw
                new ArgumentNullException(nameof(eventCollectionRetrievalService));
        }

        public async Task<Order> CreateOrderForRegistrationAsync(
            int registrationId,
            OrderItemDto[] data,
            CancellationToken cancellationToken)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data));
            }

            if (!data.Any())
            {
                throw new ArgumentException("Can't create empty order"); // can't we?
            }

            var registration = await _registrationRetrievalService
                .GetRegistrationByIdAsync(registrationId,
                    new RegistrationRetrievalOptions
                    {
                        ForUpdate = true,
                        LoadUser = true
                    },
                    cancellationToken);

            await _registrationAccessControlService
                .CheckRegistrationUpdateAccessAsync(registration, cancellationToken);

            var productIds = data.Select(o => o.ProductId).ToArray();
            var variantIds = data.Select(o => o.VariantId).ToArray();

            var productMap = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .ToDictionaryAsync(p => p.ProductId, cancellationToken);

            var variantMap = await _context.ProductVariants
                .Where(v => variantIds.Contains(v.ProductVariantId))
                .ToDictionaryAsync(v => v.ProductVariantId, cancellationToken);

            await ValidateProducts(registration, data, productMap, variantMap, cancellationToken);

            var order = new Order
            {
                User = registration.User,
                Registration = registration,
                CustomerName = registration.CustomerName ?? registration.ParticipantName,
                CustomerEmail = registration.CustomerEmail ?? registration.CustomerEmail,
                CustomerVatNumber = registration.CustomerVatNumber,
                CustomerInvoiceReference = registration.CustomerInvoiceReference,
                PaymentMethod = registration.PaymentMethod,
                OrderLines = data.Select(dto => new OrderLine(
                        productMap[dto.ProductId], dto.Quantity,
                        dto.VariantId.HasValue ? variantMap[dto.VariantId.Value] : null))
                    .ToList()
            };
            order.AddLog();

            await _context.CreateAsync(order, cancellationToken: cancellationToken);
            return order;
        }

        private async Task ValidateProducts(
            Registration registration,
            OrderItemDto[] data,
            IReadOnlyDictionary<int, Product> productMap,
            IReadOnlyDictionary<int, ProductVariant> variantMap,
            CancellationToken cancellationToken = default)
        {
            foreach (var dto in data)
            {
                if (dto.Quantity <= 0)
                {
                    throw new InputException($"Invalid quantity for product {dto.ProductId}: {dto.Quantity}");
                }

                if (!productMap.ContainsKey(dto.ProductId))
                {
                    throw new InputException($"Unknown product ID: {dto.ProductId}");
                }

                if (dto.VariantId.HasValue)
                {
                    if (!variantMap.ContainsKey(dto.VariantId.Value))
                    {
                        throw new InputException($"Unknown product variant ID: {dto.VariantId}");
                    }

                    if (variantMap[dto.VariantId.Value].ProductId != dto.ProductId)
                    {
                        throw new InputException(
                            $"Wrong product ID: {dto.ProductId} for variant ID {dto.VariantId}");
                    }
                }

                var product = productMap[dto.ProductId];
                if (product.EventInfoId != registration.EventInfoId)
                {
                    if (product.Visibility == ProductVisibility.Event)
                    {
                        throw new InputException(
                            $"Product {product.ProductId} doesn't belong to event {registration.EventInfoId}");
                    }

                    if (product.Visibility == ProductVisibility.Collection)
                    {
                        var collections = await _eventCollectionRetrievalService
                            .ListCollectionsAsync(new EventCollectionListRequest
                            {
                                Filter = new EventCollectionFilter
                                {
                                    EventInfoId = registration.EventInfoId
                                }
                            }, new EventCollectionRetrievalOptions
                            {
                                LoadMappings = true
                            }, cancellationToken);

                        if (!collections.Any(c => c.EventMappings
                            .Any(m => m.EventId == product.EventInfoId)))
                        {
                            throw new InputException(
                                $"Product {product.ProductId} cannot be added to order for event {registration.EventInfoId}");
                        }
                    }
                }
            }
        }
    }
}
