using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static Eventuras.Domain.PaymentMethod;
using static Eventuras.Domain.Registration;

namespace Eventuras.Services;

public class RegistrationService : IRegistrationService
{
    private readonly ApplicationDbContext _db;
    private readonly IPaymentMethodService _paymentMethods;
    private readonly IOrderService _orderService;
    private readonly ILogger _logger;
    private readonly IOrderVmConversionService _orderVmConversionService;

    public RegistrationService(
        ApplicationDbContext db,
        IPaymentMethodService paymentMethods,
        IOrderService orderService,
        ILogger<RegistrationService> logger,
        IOrderVmConversionService orderVmConversionService)
    {
        _db = db;
        _paymentMethods = paymentMethods;
        _orderService = orderService;
        _logger = logger;
        _orderVmConversionService = orderVmConversionService;
    }

    public async Task<bool> RegistrationExists(int id)
    {
        return await _db.Registrations.AnyAsync(e => e.RegistrationId == id);
    }

    public async Task<List<Registration>> GetAsync()
    {
        return await _db.Registrations
            .Include(m => m.User)
            .Include(m => m.EventInfo)
            .OrderByDescending(m => m.RegistrationId)
            .Take(20)
            .ToListAsync();
    }

    public async Task<Registration> GetAsync(int id)
    {
        return await _db.Registrations
            .FindAsync(id);
    }

    public async Task<Registration> GetAsync(string userId, int eventId)
    {
        var registration = await _db.Registrations
            .Where(a => (a.UserId == userId && a.EventInfoId == eventId))
            .FirstOrDefaultAsync();
        return registration;
    }

    public Task<Registration> GetWithOrdersAsync(int id)
    {
        return _db.Registrations.Where(r => r.RegistrationId == id)
            .Include(r => r.Orders)
            .ThenInclude(o => o.OrderLines)
            .SingleOrDefaultAsync();
    }

    public async Task<Registration> GetWithUserAndEventInfoAsync(int id)
    {
        return await _db.Registrations
            .Where(x => x.RegistrationId == id)
            .Include(r => r.EventInfo)
            .SingleOrDefaultAsync();
    }

    public async Task<Registration> GetWithUserAndEventInfoAndOrders(int id) =>
        await _db.Registrations
        .Include(r => r.Orders)
        .ThenInclude(o => o.OrderLines)
        .Include(r => r.User)
        .Include(r => r.EventInfo)
        .SingleOrDefaultAsync(o => o.RegistrationId == id);

    public async Task<List<Registration>> GetRegistrations(int eventId)
    {
        return await _db.Registrations
            .Where(r =>
               r.EventInfoId == eventId &&
               r.Status != RegistrationStatus.Cancelled)
            .Include(r => r.EventInfo)
            .Include(r => r.User)
            .ToListAsync();
    }

    public async Task<List<Registration>> GetCancelledRegistrations(int eventId)
    {
        return await _db.Registrations
            .Where(r =>
               r.EventInfoId == eventId &&
               r.Status == RegistrationStatus.Cancelled)
            .Include(r => r.EventInfo)
            .Include(r => r.User)
            .ToListAsync();
    }

    public async Task<List<Registration>> GetRegistrationsWithOrders(int eventId) =>
        await _db.Registrations
        .Where(r => r.EventInfoId == eventId)
        .Include(r => r.Orders)
        .ThenInclude(o => o.OrderLines)
        .Include(r => r.User)
        .ToListAsync();

    public async Task<List<Registration>> GetRegistrationsWithOrders(ApplicationUser user)
    {
        var reg = await _db.Registrations
            .Where(m => m.UserId == user.Id)
            .Include(m => m.EventInfo)
            .Include(m => m.Orders)
            .ThenInclude(o => o.OrderLines)
            .ToListAsync();
        return reg;
    }

    public async Task<int> CreateRegistration(Registration registration, List<OrderVM> ordersVm)
    {
        // Check if registration exists
        var existingRegistration = await GetAsync(registration.UserId, registration.EventInfoId);
        if (existingRegistration != null)
        {
            throw new InvalidOperationException("The user can only register once!");
        }

        // Create a registration order, if it exists
        if (ordersVm != null)
        {
            var orders = await _orderVmConversionService.OrderVmsToOrderDtos(ordersVm);
            registration.CreateOrder(orders.ToArray());
        }

        // Create the registration
        await _db.Registrations.AddAsync(registration);
        return await _db.SaveChangesAsync();
    }

    public Task<int> CreateRegistration(Registration registration) =>
        CreateRegistration(registration, null);

    public async Task<int> SetRegistrationAsVerified(int id)
    {
        var registration = await GetAsync(id);
        registration.Status = RegistrationStatus.Verified;
        registration.Verified = true;
        return await _db.SaveChangesAsync();
    }

    public async Task<int> SetRegistrationAsAttended(int id)
    {
        var registration = await GetAsync(id);
        registration.Status = RegistrationStatus.Attended;
        return await _db.SaveChangesAsync();
    }

    public async Task<int> SetRegistrationAsNotAttended(int id)
    {
        var registration = await GetAsync(id);
        registration.Status = RegistrationStatus.NotAttended;
        return await _db.SaveChangesAsync();
    }

    public async Task<Order> AddProductToRegistration(string email, int eventId, int productId, int? variantId)
    {
        var userId = await _db.Users.Where(u => u.Email == email)
            .Select(u => u.Id)
            .SingleOrDefaultAsync();
        _ = userId ??
            throw new ArgumentException(message: "Invalid email.", paramName: nameof(email));

        var registration = await _db.Registrations
            .Where(a => a.UserId == userId && a.EventInfoId == eventId)
            .Include(r => r.Orders)
            .ThenInclude(o => o.OrderLines)
            .SingleOrDefaultAsync();
        _ = registration ??
            throw new ArgumentException(message: "Invalid eventId or the user is not registered for the event", paramName: nameof(eventId));

        var vm = new List<OrderVM>
        {
            new OrderVM
            {
                ProductId = productId,
                VariantId = variantId
            }
        };

        return await _createOrUpdateOrderAsync(registration, vm);
    }

    [Obsolete("Use IOrderManagementService service")]
    public async Task<Order> CreateOrUpdateOrder(int registrationId, List<OrderVM> orders)
    {
        var registration = await _db.Registrations
            .Where(a => a.RegistrationId == registrationId)
            .Include(r => r.Orders)
                .ThenInclude(o => o.OrderLines)
                    .ThenInclude(l => l.Product)
            .Include(r => r.Orders)
                .ThenInclude(o => o.OrderLines)
                    .ThenInclude(l => l.ProductVariant)
            .SingleOrDefaultAsync();
        _ = registration ??
            throw new ArgumentException(message: "Invalid registration id.", paramName: nameof(registrationId));

        return await _createOrUpdateOrderAsync(registration, orders);
    }

    [Obsolete("Use IOrderManagementService service")]
    public Task<Order> CreateOrUpdateOrder(int registrationId, int productId, int? productVariantId)
    {
        var vm = new List<OrderVM>
        {
            new OrderVM
            {
                ProductId = productId,
                VariantId = productVariantId
            }
        };
        return CreateOrUpdateOrder(registrationId, vm);
    }

    [Obsolete("Use IOrderManagementService service")]
    private async Task<Order> _createOrUpdateOrderAsync(Registration registration, List<OrderVM> orders)
    {
        var ordersDto = await _orderVmConversionService.OrderVmsToOrderDtos(orders);

        // Create/update an order as needed.
        var order = registration.CreateOrUpdateOrder(ordersDto.ToArray());

        // Persist the changes
        await _db.SaveChangesAsync();

        return order;
    }

    public async Task<bool> UpdateParticipantInfo(int registrationId, string name, string jobTitle, string city, string Employer)
    {
        var reg = await _db.Registrations
            .Where(m => m.RegistrationId == registrationId)
            .FirstOrDefaultAsync();

        reg.ParticipantName = name;
        reg.ParticipantJobTitle = jobTitle;
        reg.ParticipantCity = city;
        reg.ParticipantEmployer = Employer;
        _db.Update(reg);
        return await _db.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateCertificateComment(int registrationId, string comment)
    {
        var reg = await _db.Registrations
            .Where(m => m.RegistrationId == registrationId)
            .FirstOrDefaultAsync();

        reg.CertificateComment = comment;
        _db.Update(reg);
        return await _db.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateCustomerInfo(int registrationId, string customerName, string customerEmail, string customerVatNumber, string customerInvoiceReference)
    {
        var reg = await _db.Registrations
            .Where(m => m.RegistrationId == registrationId)
            .Include(m => m.Orders)
            .FirstOrDefaultAsync();

        // Update customer details in registration.
        reg.CustomerName = customerName;
        reg.CustomerEmail = customerEmail;
        reg.CustomerVatNumber = customerVatNumber;
        reg.CustomerInvoiceReference = customerInvoiceReference;
        _db.Update(reg);

        // Update customer details in editable orders.
        foreach (var order in reg.Orders.Where(s => s.CanEdit == true))
        {
            order.CustomerName = customerName;
            order.CustomerEmail = customerEmail;
            order.CustomerVatNumber = customerVatNumber;
            order.CustomerInvoiceReference = customerInvoiceReference;
        }
        return await _db.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateCustomerAddress(int registrationId, string customerAddress, string customerCity, string customerZip, string customerCountry)
    {
        var reg = await _db.Registrations
            .Where(m => m.RegistrationId == registrationId)
            .Include(m => m.Orders)
            .FirstOrDefaultAsync();

        // Update customer details in registration.
        reg.CustomerAddress = customerAddress;
        reg.CustomerCity = customerCity;
        reg.CustomerZip = customerZip;
        reg.CustomerCountry = customerCountry;
        _db.Update(reg);

        return await _db.SaveChangesAsync() > 0;
    }


    public async Task<bool> UpdatePaymentMethod(int registrationId, PaymentProvider paymentMethod)
    {
        var reg = await _db.Registrations
            .Where(m => m.RegistrationId == registrationId)
            .Include(m => m.Orders)
            .FirstOrDefaultAsync();

        // Update payment method in registration.
        reg.PaymentMethod = paymentMethod;
        _db.Update(reg);

        // Update payment method in editable orders
        foreach (var order in reg.Orders.Where(s => s.CanEdit == true))
        {
            order.PaymentMethod = paymentMethod;
        }

        return await _db.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateRegistrationStatus(int registrationId, Registration.RegistrationStatus status)
    {
        var reg = await _db.Registrations
            .Where(m => m.RegistrationId == registrationId)
            .FirstOrDefaultAsync();

        reg.Status = status;
        reg.AddLog();
        _db.Update(reg);
        return await _db.SaveChangesAsync() > 0;
    }


    public async Task<bool> UpdateRegistrationType(int registrationId, Registration.RegistrationType type)
    {
        var reg = await _db.Registrations
            .Where(m => m.RegistrationId == registrationId)
            .FirstOrDefaultAsync();

        reg.Type = type;
        reg.AddLog($"Satte deltakertype til {reg.Type} ");
        _db.Update(reg);
        return await _db.SaveChangesAsync() > 0;
    }
}

public class OrderVM
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int Quantity { get; set; } = 1;
}
