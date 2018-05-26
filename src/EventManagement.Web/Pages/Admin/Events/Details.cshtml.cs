using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using static losol.EventManagement.Domain.Registration;
using static losol.EventManagement.Domain.Order;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class DetailsModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public DetailsModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public EventInfo EventInfo { get; set; }

        public class RegistrationsVm
        {
        public int RegistrationId {get;set;}
        public string Name { set;get;}
        public string Email { set;get;}
        public string Phone { set;get;}
        public string Employer {get;set;}
        public string JobTitle {get;set;}
        public string City {get;set;}
        public bool HasCertificate { get; set; }
        public int? CertificateId {get; set; }
        public string Status {get;set;}
        public string Type {get;set;}
        public List<(Product, ProductVariant, int)> Products { get; set; }
        }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            EventInfo = await _context.EventInfos
                .Include(e => e.Products)
                    .ThenInclude(p => p.ProductVariants)
                .Include(e => e.Registrations)
                .SingleOrDefaultAsync(m => m.EventInfoId == id);

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
                .Select ( x=> new RegistrationsVm{
                    RegistrationId = x.RegistrationId,
                    Name = x.User.Name,
                    Email = x.User.Email,
                    Phone = x.User.PhoneNumber,
                    JobTitle = x.ParticipantJobTitle,
                    Employer = x.ParticipantEmployer,
                    City = x.ParticipantCity,
                    Products = x.Orders.Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
                        .SelectMany(o => o.OrderLines)
                        .Where(l => l.Product != null && l.ProductVariant != null) // required because these are null for some old invalid data
                        .Select(l => new { productId = l.Product, variantId = l.ProductVariant, quantity = l.Quantity })
                        .GroupBy(l => new { l.productId, l.variantId })
                        .Select(g => ValueTuple.Create(g.Key.productId, g.Key.variantId, g.Sum(t => t.quantity)))
                        .Where(p => p.Item3 > 0)
                        .ToList(),
                    HasCertificate = x.HasCertificate,
                    CertificateId = x.CertificateId,
                    Status = x.Status.ToString(),
                    Type = x.Type.ToString()
                    })
                .ToListAsync();

            if (registrations.Any()) {
                return new JsonResult(registrations);
            }
            else {
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
                .Select ( x=> new RegistrationsVm{
                    RegistrationId = x.RegistrationId,
                    Name = x.User.Name,
                    Email = x.User.Email,
                    Phone = x.User.PhoneNumber,
                    JobTitle = x.ParticipantJobTitle,
                    Employer = x.ParticipantEmployer,
                    City = x.ParticipantCity,
                    HasCertificate = x.HasCertificate,
                    CertificateId = x.CertificateId,
                    Status = x.Status.ToString(),
                    Type = x.Type.ToString()
                    })
                .ToListAsync();

            if (registrations.Any()) {
                return new JsonResult(registrations);
            }
            else {
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
                .Select ( x=> new RegistrationsVm{
                    RegistrationId = x.RegistrationId,
                    Name = x.User.Name,
                    Email = x.User.Email,
                    Phone = x.User.PhoneNumber,
                    JobTitle = x.ParticipantJobTitle,
                    Employer = x.ParticipantEmployer,
                    City = x.ParticipantCity,
                    HasCertificate = x.HasCertificate,
                    CertificateId = x.CertificateId,
                    Status = x.Status.ToString(),
                    Type = x.Type.ToString()
                    })
                .ToListAsync();

            if (registrations.Any()) {
                return new JsonResult(registrations);
            }
            else {
                return new JsonResult("none");
            }
        }
    }
}
