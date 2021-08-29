using Eventuras.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services
{
    // FIXME: ISP violation; have to split into IRegistrationManagementService (create, update), IRegistrationRetrievalService (get, list), and IRegistrationOrderManagementService.
    // FIXME (continue): or even 4 interfaces: IRegistrationService (create), IRegistrationUpdateService (update), IRegistrationRetrievalService (get, list), and IRegistrationOrderManagementService.
    
    public interface IRegistrationService
    {
        Task<bool> RegistrationExists(int id);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<List<Registration>> GetAsync();

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<Registration> GetAsync(int id);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<Registration> GetAsync(string userId, int eventId);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<Registration> GetWithOrdersAsync(int id);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<Registration> GetWithUserAndEventInfoAsync(int id);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<Registration> GetWithUserAndEventInfoAndOrders(int id);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<List<Registration>> GetRegistrations(int eventId);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<List<Registration>> GetCancelledRegistrations(int eventId);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<List<Registration>> GetRegistrationsWithOrders(int eventId);

        [Obsolete("Use IRegistrationRetrievalService")]
        Task<List<Registration>> GetRegistrationsWithOrders(ApplicationUser user);

        [Obsolete("Use IRegistrationManagementService")]
        Task<int> CreateRegistration(Registration registration);

        [Obsolete("Use IRegistrationManagementService and IRegistrationOrderManagementService")]
        Task<int> CreateRegistration(Registration registration, List<OrderVM> ordersVm);

        [Obsolete("Use IRegistrationOrderManagementService")]
        Task<bool> AddProductToRegistration(string email, int eventId, int productId, int? variantId);

        [Obsolete("Use IRegistrationOrderManagementService")]
        Task<bool> CreateOrUpdateOrder(int registrationId, int productId, int? variantId);

        [Obsolete("Use IRegistrationOrderManagementService")]
        Task<bool> CreateOrUpdateOrder(int registrationId, List<OrderVM> ordersVm);

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
