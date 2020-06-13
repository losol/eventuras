using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Eventuras.Domain;
using Eventuras.Services;
using static Eventuras.Domain.PaymentMethod;
using static Eventuras.Domain.Registration;

namespace Eventuras.Web.Pages.Events.Register
{
    public class RegisterVM
    {
        public int EventInfoId { get; set; }
        public string UserId { get; set; }

        [Required]
        [StringLength(100)]
        [Display(Name = "Navn")]
        public string ParticipantName { get; set; }

        [Required]
        [EmailAddress]
        [Display(Name = "E-post")]
        public string Email { get; set; }


        [Required]
        [Display(Name = "Landkode")]
        public string PhoneCountryCode { get; set; } = "+47";

        [Required]
        [Phone]
        [Display(Name = "Mobiltelefon")]
        public string Phone { get; set; }

        [Display(Name = "Arbeidsplass")]
        public string ParticipantEmployer { get; set; }

        [Display(Name = "Stilling")]
        public string ParticipantJobTitle { get; set; }

        [Display(Name = "Sted/by")]
        public string ParticipantCity { get; set; }

        [Display(Name = "Kommentar til påmelding. ")]
        public string Notes { get; set; }

        [Display(Name = "Organisasjonsnummer (må fylles ut for EHF-faktura)")]
        public string CustomerVatNumber { get; set; }

        // Who pays for it?
        [Display(Name = "Fakturamottakers firmanavn")]
        public string CustomerName { get; set; }

        [Display(Name = "Fakturamottakers epost")]
        public string CustomerEmail { get; set; }


        [Display(Name = "Postnummer")]
        public string CustomerZip { get; set; }

        [Display(Name = "Poststed")]
        public string CustomerCity { get; set; }

        [Display(Name = "Land")]
        public string CustomerCountry { get; set; } = "Norge";

        [Display(Name = "Fakturareferanse")]
        public string CustomerInvoiceReference { get; set; }

        [Display(Name = "Betaling")]
        public PaymentProvider? PaymentMethod { get; set; }

        public ProductVM[] Products { get; set; }

        public RegistrationStatus Status { get; set; } = RegistrationStatus.Draft;
        public RegistrationType Type { get; set; } = RegistrationType.Participant;

        public RegisterVM() { }
        public RegisterVM(EventInfo eventinfo, PaymentProvider? defaultPaymentMethod = null)
        {
            EventInfoId = eventinfo.EventInfoId;
            PaymentMethod = defaultPaymentMethod;

            Products = new ProductVM[eventinfo.Products.Count];
            for (int i = 0; i < Products.Length; i++)
            {
                var currentProduct = eventinfo.Products[i];
                Products[i] = new ProductVM
                {
                    Value = currentProduct.ProductId,
                    IsMandatory = currentProduct.MinimumQuantity > 0,
                    IsSelected = currentProduct.MinimumQuantity > 0,
                    SelectedVariantId = currentProduct
                        .ProductVariants
                        .Select(pv => pv.ProductVariantId as int?)
                        .FirstOrDefault()
                };
            }
        }

        public bool HasProducts => Products != null && Products.Length > 0;

        public List<OrderVM> SelectedProducts =>
            Products?
                .Where(p => p.IsSelected || p.IsMandatory)
                .Select(p => new OrderVM
                {
                    ProductId = p.Value,
                    VariantId = p.SelectedVariantId
                }).ToList();
    }

}
