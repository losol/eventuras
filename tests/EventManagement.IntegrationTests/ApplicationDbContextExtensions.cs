using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.IntegrationTests
{
    public static class ApplicationDbContextExtensions
    {
        public const string Placeholder = "__Placeholder__";

        public static async Task<IDisposableEntity<EventInfo>> CreateEventAsync(
            this ApplicationDbContext context,
            string title = Placeholder,
            string description = Placeholder,
            string code = Placeholder,
            string city = Placeholder,
            EventInfo.EventInfoType eventInfoType = EventInfo.EventInfoType.Conference,
            bool featured = false,
            DateTime? dateStart = null,
            DateTime? dateEnd = null,
            Product[] products = null)
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
                Products = products?.ToList()
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
    }
}
