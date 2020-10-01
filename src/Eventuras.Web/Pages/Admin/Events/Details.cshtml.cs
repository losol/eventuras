using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;
using Eventuras.Services.ExternalSync;
using static Eventuras.Domain.Registration;
using static Eventuras.Domain.Order;

namespace Eventuras.Pages.Admin.Events
{
    public class DetailsModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IEventSynchronizationService _eventSynchronizationService;

        public DetailsModel(
            ApplicationDbContext context,
            IEventSynchronizationService eventSynchronizationService,
            IEventInfoRetrievalService eventInfoRetrievalService)
        {
            _eventSynchronizationService = eventSynchronizationService ?? throw new ArgumentNullException(nameof(eventSynchronizationService));
            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw new ArgumentNullException(nameof(eventInfoRetrievalService));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public EventInfo EventInfo { get; set; }

        public string[] SyncProviderNames => _eventSynchronizationService.SyncProviderNames;


        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            EventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(id.Value, new EventInfoRetrievalOptions
            {
                LoadProducts = true,
                LoadRegistrations = true
            });

            if (EventInfo == null)
            {
                return NotFound();
            }

            return Page();
        }


        public async Task<JsonResult> OnGetParticipants(int? id)
        {
            if (id == null)
            {
                return new JsonResult("No event id submitted.");
            }

            var registrations = await _context.Registrations
                .Where(
                    r => r.EventInfoId == id &&
                    r.Status != RegistrationStatus.Cancelled &&
                    r.Type == RegistrationType.Participant)
                .Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines)
                        .ThenInclude(ol => ol.Product)
                .Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines)
                        .ThenInclude(ol => ol.ProductVariant)
                .Include(r => r.User)
                .ToListAsync();
            var vms = registrations.Select(x => new RegistrationsVm
            {
                RegistrationId = x.RegistrationId,
                Name = x.User.Name,
                Email = x.User.Email,
                Phone = x.User.PhoneNumber,
                userId = x.User.Id,
                JobTitle = x.ParticipantJobTitle,
                Notes = x.Notes,
                Employer = x.ParticipantEmployer,
                City = x.ParticipantCity,
                Products = x.Products.Select(dto => new RegistrationOrderVm(dto)).ToList(),
                HasCertificate = x.HasCertificate,
                CertificateId = x.CertificateId,
                Status = x.Status.ToString(),
                Type = x.Type.ToString()
            });

            if (vms.Any())
            {
                return new JsonResult(vms);
            }
            else
            {
                return new JsonResult("none");
            }
        }

        public async Task<JsonResult> OnGetOtherAttendees(int? id)
        {
            if (id == null)
            {
                return new JsonResult("No event id submitted.");
            }

            var registrations = await _context.Registrations
                .Where(
                    r => r.EventInfoId == id &&
                    r.Status != RegistrationStatus.Cancelled &&
                    r.Type != RegistrationType.Participant)
                .Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines)
                        .ThenInclude(ol => ol.Product)
                .Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines)
                        .ThenInclude(ol => ol.ProductVariant)
                .Include(r => r.User)
                .ToListAsync();
            var vms = registrations.Select(x => new RegistrationsVm
            {
                RegistrationId = x.RegistrationId,
                Name = x.User.Name,
                Email = x.User.Email,
                Phone = x.User.PhoneNumber,
                userId = x.User.Id,
                JobTitle = x.ParticipantJobTitle,
                Employer = x.ParticipantEmployer,
                City = x.ParticipantCity,
                Notes = x.Notes,
                Products = x.Products.Select(dto => new RegistrationOrderVm(dto)).ToList(),
                HasCertificate = x.HasCertificate,
                CertificateId = x.CertificateId,
                Status = x.Status.ToString(),
                Type = x.Type.ToString()
            });

            if (vms.Any())
            {
                return new JsonResult(vms);
            }
            else
            {
                return new JsonResult("none");
            }
        }

        public async Task<JsonResult> OnGetCancelled(int? id)
        {
            if (id == null)
            {
                return new JsonResult("No event id submitted.");
            }

            var registrations = await _context.Registrations
                .Where(
                    r => r.EventInfoId == id &&
                    r.Status == RegistrationStatus.Cancelled)
                .Select(x => new RegistrationsVm
                {
                    RegistrationId = x.RegistrationId,
                    Name = x.User.Name,
                    Email = x.User.Email,
                    Phone = x.User.PhoneNumber,
                    userId = x.User.Id,
                    Notes = x.Notes,
                    JobTitle = x.ParticipantJobTitle,
                    Employer = x.ParticipantEmployer,
                    City = x.ParticipantCity,
                    HasCertificate = x.HasCertificate,
                    CertificateId = x.CertificateId,
                    Status = x.Status.ToString(),
                    Type = x.Type.ToString()
                })
                .ToListAsync();

            if (registrations.Any())
            {
                return new JsonResult(registrations);
            }
            else
            {
                return new JsonResult("none");
            }
        }

        internal class RegistrationsVm
        {
            public int RegistrationId { get; set; }
            public string Name { set; get; }
            public string Email { set; get; }
            public string userId { get; set; }
            public string Phone { set; get; }
            public string Employer { get; set; }
            public string Notes { get; set; }
            public string JobTitle { get; set; }
            public string City { get; set; }
            public bool HasCertificate { get; set; }
            public int? CertificateId { get; set; }
            public string Status { get; set; }
            public string Type { get; set; }
            public List<RegistrationOrderVm> Products { get; set; }
        }

        internal class RegistrationsProductVm
        {
            public int ProductId { get; set; }
            public string Name { get; set; }

            public RegistrationsProductVm(Product product)
            {
                this.ProductId = product.ProductId;
                this.Name = product.Name;
            }
        }

        internal class RegistrationsVariantVm
        {
            public int ProductVariantId { get; set; }
            public string Name { get; set; }

            public RegistrationsVariantVm(ProductVariant variant)
            {
                this.ProductVariantId = variant.ProductVariantId;
                this.Name = variant.Name;
            }
            public static RegistrationsVariantVm Create(ProductVariant variant) =>
                variant == null ? null : new RegistrationsVariantVm(variant);
        }

        internal class RegistrationOrderVm
        {
            public RegistrationsProductVm Item1 { get; }
            public RegistrationsVariantVm Item2 { get; }
            public int Item3 { get; }

            public RegistrationOrderVm(OrderDTO dto) : this(dto.Product, dto.Variant, dto.Quantity)
            {
            }

            public RegistrationOrderVm(Product product, ProductVariant variant, int quantity)
            {
                this.Item1 = new RegistrationsProductVm(product);
                this.Item2 = RegistrationsVariantVm.Create(variant);
                this.Item3 = quantity;
            }
        }
    }
}
