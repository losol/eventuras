using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using NodaTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.TestAbstractions
{
    public static class TestServiceScopeExtensions
    {
        public static async Task<IDisposableEntity<ApplicationUser>> CreateUserAsync(
            this TestServiceScope scope,
            string name = TestingConstants.Placeholder,
            string email = TestingConstants.Placeholder,
            string password = TestingConstants.Placeholder,
            string phone = TestingConstants.Placeholder,
            string[] roles = null,
            string role = null,
            Organization organization = null,
            bool archived = false)
        {
            var userManager = scope.GetService<UserManager<ApplicationUser>>();

            if (email == TestingConstants.Placeholder)
            {
                email = $"{Guid.NewGuid()}@email.com";
            }

            if (name == TestingConstants.Placeholder)
            {
                name = email;
            }

            if (password == TestingConstants.Placeholder)
            {
                password = TestingConstants.DefaultPassword;
            }

            if (phone == TestingConstants.Placeholder)
            {
                phone = $"+{DateTimeOffset.Now.ToUnixTimeMilliseconds():####}";
            }

            if (roles == null && !string.IsNullOrEmpty(role))
            {
                roles = new[] { role };
            }

            var user = new ApplicationUser
            {
                Name = name,
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                PhoneNumber = phone,
                PhoneNumberConfirmed = !string.IsNullOrEmpty(phone),
                Archived = archived
            };

            await userManager.CreateAsync(user, password);

            if (roles?.Length > 0)
            {
                await userManager.AddToRolesAsync(user, roles);
            }

            if (organization != null)
            {
                await scope.CreateOrganizationMemberAsync(user, organization, role: role, roles: roles);
            }

            return new DisposableUser(user, userManager);
        }

        public static async Task<IDisposableEntity<EventCollection>> CreateEventCollectionAsync(
            this TestServiceScope scope,
            string name = TestingConstants.Placeholder,
            string slug = null,
            string description = null,
            bool featured = false,
            string featuredImageUrl = TestingConstants.Placeholder,
            string featuredImageCaption = TestingConstants.Placeholder,
            Organization organization = null,
            int? organizationId = null)
        {
            if (name == TestingConstants.Placeholder)
            {
                name = $"Test Collection {Guid.NewGuid()}";
            }

            organizationId ??= (organization ?? (await scope.CreateOrganizationAsync()).Entity).OrganizationId;

            if (featuredImageUrl == TestingConstants.Placeholder)
            {
                featuredImageUrl = featured ? $"http://some.featured.image.url/{Guid.NewGuid()}" : null;
            }

            if (featuredImageCaption == TestingConstants.Placeholder)
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

            await scope.Db.EventCollections.AddAsync(collection);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<EventCollection>(collection, scope.Db);
        }

        public static async Task<IDisposableEntity<EventInfo>> CreateEventAsync(
            this TestServiceScope scope,
            string title = TestingConstants.Placeholder,
            string description = TestingConstants.Placeholder,
            string slug = TestingConstants.Placeholder,
            string city = TestingConstants.Placeholder,
            EventInfo.EventInfoStatus status = EventInfo.EventInfoStatus.RegistrationsOpen,
            EventInfo.EventInfoType eventInfoType = EventInfo.EventInfoType.Conference,
            bool featured = false,
            LocalDate? dateStart = null,
            LocalDate? dateEnd = null,
            Product[] products = null,
            Organization organization = null,
            int organizationId = TestingConstants.OrganizationId,
            int maxParticipants = 0,
            EventCollection collection = null,
            EventCollection[] collections = null,
            bool archived = false)
        {
            if (title == TestingConstants.Placeholder)
            {
                title = $"Test Event {Guid.NewGuid()}";
            }

            if (description == TestingConstants.Placeholder)
            {
                description = $"Test Event Description {Guid.NewGuid()}";
            }

            if (slug == TestingConstants.Placeholder)
            {
                slug = Guid.NewGuid().ToString();
            }

            if (city == TestingConstants.Placeholder)
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
                Slug = slug,
                Featured = featured,
                DateStart = dateStart,
                DateEnd = dateEnd,
                Type = eventInfoType,
                City = city,
                Status = status,
                MaxParticipants = maxParticipants,
                Products = products?.ToList(),
                Archived = archived,
                OrganizationId = organization?.OrganizationId ?? organizationId,
                CollectionMappings = collections?.Select(c => new EventCollectionMapping
                {
                    CollectionId = c.CollectionId
                }).ToList()
            };
            await scope.Db.EventInfos.AddAsync(eventInfo);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<EventInfo>(eventInfo, scope.Db);
        }

        public static async Task<IDisposableEntity<Product>> CreateProductAsync(
            this TestServiceScope scope,
            EventInfo eventInfo,
            string name = TestingConstants.Placeholder,
            string description = TestingConstants.Placeholder,
            int price = 100,
            int vatPercent = 5,
            int minimumQuantity = 1,
            bool archived = false,
            bool published = true,
            ProductVisibility visibility = ProductVisibility.Event,
            ProductVariant[] variants = null)
        {
            if (name == TestingConstants.Placeholder)
            {
                name = $"Test Product {Guid.NewGuid()}";
            }

            if (description == TestingConstants.Placeholder)
            {
                description = $"Test Product Description {Guid.NewGuid()}";
            }

            var product = new Product
            {
                Name = name,
                Description = description,
                EventInfo = eventInfo,
                Price = price,
                VatPercent = vatPercent,
                MinimumQuantity = minimumQuantity,
                ProductVariants = variants?.ToList(),
                Archived = archived,
                Published = published,
                Visibility = visibility
            };

            await scope.Db.Products.AddAsync(product);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<Product>(product, scope.Db);
        }

        public static async Task<IDisposableEntity<ProductVariant>> CreateProductVariantAsync(
            this TestServiceScope scope,
            Product product,
            string name = TestingConstants.Placeholder,
            string description = TestingConstants.Placeholder,
            int price = 100,
            int vatPercent = 5,
            bool archived = false)
        {
            if (name == TestingConstants.Placeholder)
            {
                name = $"Test Product Variant {Guid.NewGuid()}";
            }

            if (description == TestingConstants.Placeholder)
            {
                description = $"Test Product Variant Description {Guid.NewGuid()}";
            }

            var variant = new ProductVariant
            {
                Product = product,
                Name = name,
                Description = description,
                Price = price,
                VatPercent = vatPercent,
                Archived = archived
                // TODO: add other props
            };

            await scope.Db.ProductVariants.AddAsync(variant);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<ProductVariant>(variant, scope.Db);
        }

        public static async Task<IDisposableEntity<Registration>> CreateRegistrationAsync(
            this TestServiceScope scope,
            EventInfo eventInfo,
            ApplicationUser user,
            Registration.RegistrationStatus status = Registration.RegistrationStatus.Verified,
            Registration.RegistrationType type = Registration.RegistrationType.Participant,
            Instant? time = null)
        {
            var registration = new Registration
            {
                EventInfoId = eventInfo.EventInfoId,
                User = user,
                Status = status,
                Type = type,
                ParticipantName = user.Name,
                RegistrationTime = time ?? SystemClock.Instance.Now()
                // TODO: add other params
            };
            await scope.Db.Registrations.AddAsync(registration);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<Registration>(registration, scope.Db);
        }

        public static async Task<IDisposableEntity<Certificate>> CreateCertificateAsync(
            this TestServiceScope scope,
            Registration registration)
        {
            var cert = registration.CreateCertificate();
            await scope.Db.Certificates.AddAsync(cert);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<Certificate>(cert, scope.Db);
        }

        public static async Task<IDisposableEntity<Certificate>> CreateCertificateAsync(
            this TestServiceScope scope)
        {
            var cert = new Certificate();
            await scope.Db.Certificates.AddAsync(cert);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<Certificate>(cert, scope.Db);
        }

        public static async Task<IDisposableEntity<Order>> CreateOrderAsync(
            this TestServiceScope scope,
            Registration registration,
            Product[] products = null,
            ProductVariant[] variants = null,
            int[] quantities = null,
            ApplicationUser user = null,
            string userId = null,
            Order.OrderStatus status = Order.OrderStatus.Verified,
            PaymentMethod.PaymentProvider paymentProvider = PaymentMethod.PaymentProvider.EmailInvoice,
            Instant? time = null)
        {
            var order = new Order
            {
                OrderTime = time ?? SystemClock.Instance.Now(),
                UserId = user?.Id ?? userId ?? registration.UserId,
                Registration = registration,
                PaymentMethod = paymentProvider,
                OrderLines = products?.Select((p, i) => new OrderLine
                {
                    Product = p,
                    ProductVariant = variants?.Length > i ? variants[i] : null,
                    Quantity = quantities?.Length > i ? quantities[i] : p.MinimumQuantity,
                    ProductDescription = products[i].Description,
                    ProductVariantDescription = variants?.Length > i ? variants[i]?.Description : null,
                    VatPercent = p.VatPercent,
                    Price = variants?.Length > i ? variants[i]?.Price ?? p.Price : p.Price,
                    ProductName = p.Name,
                    ProductVariantName = variants?.Length > i ? variants[i]?.Name : null,
                }).ToList()
            };

            if (status == Order.OrderStatus.Invoiced ||
                status == Order.OrderStatus.Refunded)
            {
                order.Status = Order.OrderStatus.Verified;
            }

            if (status == Order.OrderStatus.Refunded)
            {
                order.Status = Order.OrderStatus.Invoiced;
            }

            if (status != Order.OrderStatus.Draft)
            {
                order.Status = status;
            }

            await scope.Db.Orders.AddAsync(order);
            await scope.Db.SaveChangesAsync();

            return new DisposableEntity<Order>(order, scope.Db);
        }

        public static async Task<IDisposableEntity<Order>> CreateOrderAsync(
            this TestServiceScope scope,
            Registration registration,
            Product product,
            ProductVariant variant = null,
            int quantity = 1,
            Order.OrderStatus status = Order.OrderStatus.Verified,
            ApplicationUser user = null,
            string userId = null,
            PaymentMethod.PaymentProvider paymentProvider = PaymentMethod.PaymentProvider.EmailInvoice)
        {
            return await scope.CreateOrderAsync(registration,
                new[] { product },
                variant != null ? new[] { variant } : null,
                new[] { quantity },
                user, userId,
                status, paymentProvider);
        }

        public static async Task<IDisposableEntity<ExternalEvent>> CreateExternalEventAsync(
            this TestServiceScope scope,
            EventInfo eventInfo,
            string externalServiceName = TestingConstants.Placeholder,
            string externalEventId = TestingConstants.Placeholder)
        {
            if (externalServiceName == TestingConstants.Placeholder)
            {
                externalServiceName = "Test";
            }

            if (externalEventId == TestingConstants.Placeholder)
            {
                externalEventId = Guid.NewGuid().ToString();
            }

            var externalEvent = new ExternalEvent
            {
                EventInfo = eventInfo,
                ExternalServiceName = externalServiceName,
                ExternalEventId = externalEventId
            };
            await scope.Db.ExternalEvents.AddAsync(externalEvent);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<ExternalEvent>(externalEvent, scope.Db);
        }

        public static async Task<IDisposableEntity<Organization>> CreateOrganizationAsync(
            this TestServiceScope scope,
            string name = TestingConstants.Placeholder,
            string hostname = null,
            string[] hostnames = null,
            bool inactive = false)
        {
            if (name == TestingConstants.Placeholder)
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
                Active = !inactive,
                Hostnames = hostnames?.Select(h => new OrganizationHostname
                {
                    Hostname = h,
                    Active = !inactive
                }).ToList()
            };

            await scope.Db.Organizations.AddAsync(org);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<Organization>(org, scope.Db);
        }

        public static async Task<IDisposableEntity<OrganizationMember>> CreateOrganizationMemberAsync(
            this TestServiceScope scope,
            ApplicationUser user = null,
            Organization organization = null,
            int? organizationId = null,
            string[] roles = null,
            string role = null)
        {
            organizationId ??= (organization ?? (await scope.CreateOrganizationAsync()).Entity).OrganizationId;

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

            await scope.Db.OrganizationMembers.AddAsync(member);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<OrganizationMember>(member, scope.Db);
        }

        public static async Task<IDisposableEntity<OrganizationSetting>> CreateOrganizationSettingAsync(
            this TestServiceScope scope,
            Organization organization,
            string name, string value)
        {
            var setting = new OrganizationSetting
            {
                OrganizationId = organization.OrganizationId,
                Name = name,
                Value = value
            };

            await scope.Db.OrganizationSettings.AddAsync(setting);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<OrganizationSetting>(setting, scope.Db);
        }

        public static async Task<IDisposableEntity<EmailNotification>> CreateEmailNotificationAsync(
            this TestServiceScope scope,
            string subject = TestingConstants.Placeholder,
            string body = TestingConstants.Placeholder,
            EventInfo eventInfo = null,
            Product product = null,
            Organization organization = null,
            ApplicationUser createdByUser = null,
            NotificationStatus? status = null,
            int? totalSent = null,
            int? totalErrors = null,
            IEnumerable<string> emailAddresses = null,
            IEnumerable<ApplicationUser> recipientUsers = null,
            IEnumerable<Registration> registrations = null)
        {
            if (TestingConstants.Placeholder.Equals(subject))
            {
                subject = $"Test email subject {Guid.NewGuid()}";
            }

            if (TestingConstants.Placeholder.Equals(body))
            {
                body = $"Test email body {Guid.NewGuid()}";
            }

            var recipients = new List<NotificationRecipient>();

            if (emailAddresses != null)
            {
                recipients.AddRange(emailAddresses
                    .Select(NotificationRecipient.Email));
            }

            if (recipientUsers != null)
            {
                recipients.AddRange(recipientUsers
                    .Select(NotificationRecipient.Email));
            }

            if (registrations != null)
            {
                recipients.AddRange(registrations
                    .Select(NotificationRecipient.Email));
            }

            var disposables = new List<IDisposable>();
            if (createdByUser == null)
            {
                var disposableUser = await scope.CreateUserAsync();
                createdByUser = disposableUser.Entity;
                disposables.Add(disposableUser);
            }

            NotificationStatistics stats = null;
            if (totalSent.HasValue || totalErrors.HasValue)
            {
                stats = new NotificationStatistics
                {
                    SentTotal = totalSent ?? 0,
                    ErrorsTotal = totalErrors ?? 0
                };
            }

            eventInfo ??= product?.EventInfo;
            organization ??= eventInfo?.Organization;

            var notification = new EmailNotification(subject, body)
            {
                EventInfo = eventInfo,
                Product = product,
                Organization = organization,
                CreatedByUser = createdByUser,
                Status = status ?? NotificationStatus.New,
                Recipients = recipients,
                Statistics = stats
            };

            await scope.Db.Notifications.AddAsync(notification);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<EmailNotification>(notification, scope.Db, disposables.ToArray());
        }

        public static async Task<IDisposableEntity<SmsNotification>> CreateSmsNotificationAsync(
            this TestServiceScope scope,
            string message = TestingConstants.Placeholder,
            EventInfo eventInfo = null,
            Product product = null,
            Organization organization = null,
            ApplicationUser createdByUser = null,
            NotificationStatus? status = null,
            int? totalSent = null,
            int? totalErrors = null,
            IEnumerable<string> phones = null,
            IEnumerable<ApplicationUser> recipientUsers = null,
            IEnumerable<Registration> registrations = null)
        {
            if (TestingConstants.Placeholder.Equals(message))
            {
                message = $"Test SMS message {Guid.NewGuid()}";
            }

            var recipients = new List<NotificationRecipient>();

            if (phones != null)
            {
                recipients.AddRange(phones
                    .Select(NotificationRecipient.Sms));
            }

            if (recipientUsers != null)
            {
                recipients.AddRange(recipientUsers
                    .Select(NotificationRecipient.Sms));
            }

            if (registrations != null)
            {
                recipients.AddRange(registrations
                    .Select(NotificationRecipient.Sms));
            }

            var disposables = new List<IDisposable>();
            if (createdByUser == null)
            {
                var disposableUser = await scope.CreateUserAsync();
                createdByUser = disposableUser.Entity;
                disposables.Add(disposableUser);
            }

            NotificationStatistics stats = null;
            if (totalSent.HasValue || totalErrors.HasValue)
            {
                stats = new NotificationStatistics
                {
                    SentTotal = totalSent ?? 0,
                    ErrorsTotal = totalErrors ?? 0
                };
            }

            eventInfo ??= product?.EventInfo;
            organization ??= eventInfo?.Organization;

            var notification = new SmsNotification(message)
            {
                EventInfo = eventInfo,
                Product = product,
                Organization = organization,
                CreatedByUser = createdByUser,
                Status = status ?? NotificationStatus.New,
                Recipients = recipients,
                Statistics = stats
            };

            await scope.Db.Notifications.AddAsync(notification);
            await scope.Db.SaveChangesAsync();
            return new DisposableEntity<SmsNotification>(notification, scope.Db, disposables.ToArray());
        }
    }
}
