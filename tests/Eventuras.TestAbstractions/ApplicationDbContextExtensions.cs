using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.IntegrationTests;

namespace Eventuras.TestAbstractions
{
    public static class ApplicationDbContextExtensions
    {
        public const string Placeholder = "__Placeholder__";

        public static async Task<IDisposableEntity<EventCollection>> CreateEventCollectionAsync(
            this ApplicationDbContext context,
            string name = Placeholder,
            string slug = null,
            string description = null,
            bool featured = false,
            string featuredImageUrl = Placeholder,
            string featuredImageCaption = Placeholder,
            Organization organization = null,
            int? organizationId = null)
        {

            if (name == Placeholder)
            {
                name = $"Test Collection {Guid.NewGuid()}";
            }

            organizationId ??= (organization ?? (await context.CreateOrganizationAsync()).Entity).OrganizationId;

            if (featuredImageUrl == Placeholder)
            {
                featuredImageUrl = featured ? $"http://some.featured.image.url/{Guid.NewGuid()}" : null;
            }

            if (featuredImageCaption == Placeholder)
            {
                featuredImageCaption = featured ? $"Some featured image caption {Guid.NewGuid()}" : null;
            }

            var collection = new EventCollection
            {
                Name = name,
                OrganizationId = organizationId.Value,
                Slug = slug,
                Description = description,
                Featured = featured,
                FeaturedImageUrl = featuredImageUrl,
                FeaturedImageCaption = featuredImageCaption
            };

            await context.EventCollections.AddAsync(collection);
            await context.SaveChangesAsync();
            return new DisposableEntity<EventCollection>(collection, context);
        }

        public static async Task<IDisposableEntity<EventInfo>> CreateEventAsync(
            this ApplicationDbContext context,
            string title = Placeholder,
            string description = Placeholder,
            string code = Placeholder,
            string city = Placeholder,
            EventInfo.EventInfoStatus status = EventInfo.EventInfoStatus.Planned,
            EventInfo.EventInfoType eventInfoType = EventInfo.EventInfoType.Conference,
            bool featured = false,
            DateTime? dateStart = null,
            DateTime? dateEnd = null,
            Product[] products = null,
            Organization organization = null,
            int? organizationId = null,
            EventCollection collection = null,
            EventCollection[] collections = null)
        {
            if (title == Placeholder)
            {
                title = $"Test Event {Guid.NewGuid()}";
            }

            if (description == Placeholder)
            {
                description = $"Test Event Description {Guid.NewGuid()}";
            }

            if (code == Placeholder)
            {
                code = Guid.NewGuid().ToString();
            }

            if (city == Placeholder)
            {
                city = "Oslo";
            }

            if (collections == null && collection != null)
            {
                collections = new[] { collection };
            }

            var eventInfo = new EventInfo
            {
                Title = title,
                Description = description,
                Code = code,
                Featured = featured,
                DateStart = dateStart,
                DateEnd = dateEnd,
                Type = eventInfoType,
                City = city,
                Status = status,
                Products = products?.ToList(),
                OrganizationId = organizationId ?? organization?.OrganizationId,
                CollectionMappings = collections?.Select(c => new EventCollectionMapping
                {
                    CollectionId = c.CollectionId
                }).ToList()
            };
            context.EventInfos.Add(eventInfo);
            await context.SaveChangesAsync();
            return new DisposableEntity<EventInfo>(eventInfo, context);
        }

        public static async Task<IDisposableEntity<Product>> CreateProductAsync(
            this ApplicationDbContext context,
            EventInfo eventInfo,
            string name = Placeholder,
            int vatPercent = 5,
            int minimumQuantity = 1,
            ProductVariant[] variants = null)
        {

            if (name == Placeholder)
            {
                name = $"Test Product {Guid.NewGuid()}";
            }

            var product = new Product
            {
                Name = name,
                Eventinfo = eventInfo,
                VatPercent = vatPercent,
                MinimumQuantity = minimumQuantity,
                ProductVariants = variants?.ToList()
            };

            context.Products.Add(product);
            await context.SaveChangesAsync();
            return new DisposableEntity<Product>(product, context);
        }

        public static async Task<IDisposableEntity<ProductVariant>> CreateProductVariantAsync(
            this ApplicationDbContext context,
            Product product,
            string name = Placeholder,
            int vatPercent = 5)
        {
            if (name == Placeholder)
            {
                name = $"Test Product Variant {Guid.NewGuid()}";
            }

            var variant = new ProductVariant
            {
                Product = product,
                Name = name,
                VatPercent = vatPercent
                // TODO: add other props
            };

            context.ProductVariants.Add(variant);
            await context.SaveChangesAsync();
            return new DisposableEntity<ProductVariant>(variant, context);
        }

        public static async Task<IDisposableEntity<Registration>> CreateRegistrationAsync(
            this ApplicationDbContext context,
            EventInfo eventInfo,
            ApplicationUser user,
            Registration.RegistrationStatus status = Registration.RegistrationStatus.Verified,
            DateTime? time = null)
        {
            var registration = new Registration
            {
                EventInfoId = eventInfo.EventInfoId,
                User = user,
                Status = status,
                ParticipantName = user.Name,
                RegistrationTime = time ?? DateTime.UtcNow
                // TODO: add other params
            };
            context.Registrations.Add(registration);
            await context.SaveChangesAsync();
            return new DisposableEntity<Registration>(registration, context);
        }

        public static async Task<IDisposableEntity<Order>> CreateOrderAsync(
            this ApplicationDbContext context,
            Registration registration,
            Product[] products = null,
            ProductVariant[] variants = null,
            int[] quantities = null,
            Order.OrderStatus status = Order.OrderStatus.Verified)
        {
            var order = new Order
            {
                Registration = registration,
                Status = status,
                OrderLines = products?.Select((p, i) => new OrderLine
                {
                    Product = p,
                    ProductVariant = variants != null && variants.Length > i ? variants[i] : null,
                    Quantity = quantities != null && quantities.Length > i ? quantities[i] : p.MinimumQuantity,
                    VatPercent = p.VatPercent,
                    Price = p.Price,
                    ProductName = p.Name
                }).ToList()
            };

            context.Orders.Add(order);
            await context.SaveChangesAsync();
            return new DisposableEntity<Order>(order, context);
        }

        public static async Task<IDisposableEntity<Order>> CreateOrderAsync(
            this ApplicationDbContext context,
            Registration registration,
            Product product,
            ProductVariant variant = null,
            int quantity = 1,
            Order.OrderStatus status = Order.OrderStatus.Verified)
        {
            return await context.CreateOrderAsync(registration,
                new[] { product },
                variant != null ? new[] { variant } : null,
                new[] { quantity },
                status);
        }

        public static async Task<IDisposableEntity<ExternalEvent>> CreateExternalEventAsync(
            this ApplicationDbContext context,
            EventInfo eventInfo,
            string externalServiceName = Placeholder,
            string externalEventId = Placeholder)
        {
            if (externalServiceName == Placeholder)
            {
                externalServiceName = "Test";
            }

            if (externalEventId == Placeholder)
            {
                externalEventId = Guid.NewGuid().ToString();
            }

            var externalEvent = new ExternalEvent
            {
                EventInfo = eventInfo,
                ExternalServiceName = externalServiceName,
                ExternalEventId = externalEventId
            };
            await context.ExternalEvents.AddAsync(externalEvent);
            await context.SaveChangesAsync();
            return new DisposableEntity<ExternalEvent>(externalEvent, context);
        }

        public static async Task<IDisposableEntity<Organization>> CreateOrganizationAsync(
            this ApplicationDbContext context,
            string name = Placeholder,
            string hostname = null,
            string[] hostnames = null)
        {
            if (name == Placeholder)
            {
                name = $"Test Org {Guid.NewGuid()}";
            }

            if (hostnames == null && hostname != null)
            {
                hostnames = new[] { hostname };
            }

            var org = new Organization
            {
                Name = name,
                Hostnames = hostnames?.Select(h => new OrganizationHostname
                {
                    Hostname = h,
                    Active = true
                }).ToList()
            };

            await context.Organizations.AddAsync(org);
            await context.SaveChangesAsync();
            return new DisposableEntity<Organization>(org, context);
        }

        public static async Task<IDisposableEntity<OrganizationMember>> CreateOrganizationMemberAsync(
            this ApplicationDbContext context,
            ApplicationUser user = null,
            Organization organization = null,
            int? organizationId = null,
            string[] roles = null,
            string role = null)
        {
            organizationId ??= (organization ?? (await context.CreateOrganizationAsync()).Entity).OrganizationId;

            if (roles == null && role != null)
            {
                roles = new[] { role };
            }

            var member = new OrganizationMember
            {
                OrganizationId = organizationId.Value,
                User = user,
                Roles = roles?.Select(r => new OrganizationMemberRole
                {
                    Role = r
                }).ToList()
            };

            await context.OrganizationMembers.AddAsync(member);
            await context.SaveChangesAsync();
            return new DisposableEntity<OrganizationMember>(member, context);
        }
    }
}
