using losol.EventManagement.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static losol.EventManagement.Domain.PaymentMethod;

namespace losol.EventManagement.Services
{
    // FIXME: ISP violation; have to split into IRegistrationManagementService (create, update), IRegistrationRetrievalService (get, list), and IRegistrationOrderManagementService.
    // FIXME (continue): or even 4 interfaces: IRegistrationService (create), IRegistrationUpdateService (update), IRegistrationRetrievalService (get, list), and IRegistrationOrderManagementService.

    public interface IRegistrationService
    {
        Task<bool> RegistrationExists(int id);
        Task<List<Registration>> GetAsync();
        Task<Registration> GetAsync(int id);
        Task<Registration> GetAsync(string userId, int eventId);
        Task<Registration> GetWithOrdersAsync(int id);
        Task<Registration> GetWithUserAndEventInfoAsync(int id);
        Task<Registration> GetWithUserAndEventInfoAndOrders(int id);
        Task<List<Registration>> GetRegistrations(int eventId);
        Task<List<Registration>> GetCancelledRegistrations(int eventId);
        Task<List<Registration>> GetRegistrationsWithOrders(int eventId);
        Task<List<Registration>> GetRegistrationsWithOrders(ApplicationUser user);

        Task<int> CreateRegistration(Registration registration);
        Task<int> CreateRegistration(Registration registration, List<OrderVM> ordersVm);
        [Obsolete]
        Task<bool> AddProductToRegistration(string email, int eventId, int productId, int? variantId);
        Task<bool> CreateOrUpdateOrder(int registrationId, int productId, int? variantId); // FIXME: ISP violation; to be moved to IRegistrationOrderManagementService
        Task<bool> CreateOrUpdateOrder(int registrationId, List<OrderVM> ordersVm); // FIXME: ISP violation; to be moved to IRegistrationOrderManagementService

        Task<bool> UpdateParticipantInfo(int registrationId, string name, string JobTitle, string city, string Employer);
        Task<bool> UpdateCustomerInfo(int registrationId, string customerName, string customerEmail, string customerVatNumber, string customerInvoiceReference);
        Task<bool> UpdateCustomerAddress(int registrationId, string customerAddress, string customerCity, string customerZip, string customerCountry);
        Task<bool> UpdatePaymentMethod(int registrationId, PaymentProvider provider);
        Task<bool> UpdateRegistrationStatus(int registrationId, Registration.RegistrationStatus registrationStatus);
        Task<bool> UpdateCertificateComment(int registrationId, string comment);

        Task<bool> UpdateRegistrationType(int registrationId, Registration.RegistrationType registrationType);
        // Set status
        Task<int> SetRegistrationAsVerified(int id);
        Task<int> SetRegistrationAsAttended(int id);
        Task<int> SetRegistrationAsNotAttended(int id);
    }
}
