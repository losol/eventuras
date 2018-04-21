using System;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Web.ViewModels
{
    public class CertificateVM
    {
        public string CertificateGuid { get; set; }

        public string Title { get;set; } 
        public string Description { get;set; }

        public string RecipientName {get;set;}
        public string IssuerOrganizationName {get;set;}
        public string IssuerOrganizationLogoUrl {get;set;}
        public string IssuerPersonName {get;set;}
        public string Accreditation { get; set; }

        public DateTime? EventDateStart { get;set; }
        public DateTime? EventDateEnd { get;set; }

        public string City { get; set; }
        public string Date { get; set; }

        public static CertificateVM Mock => new CertificateVM 
        {
            RecipientName = "Ole Kristian Losvik",
            IssuerOrganizationName = "Nordland Legeforening",
            IssuerOrganizationLogoUrl = "/assets/images/logos/logo-nordland_legeforening-small-transparent.png",
            IssuerPersonName = "Tove Myrbakk",

            EventDateStart = DateTime.Now.AddDays(-7),
            CertificateGuid = Guid.NewGuid().ToString(),
            City = "Bodø",
            Date = DateTime.Now.ToString("dd.MM.yyyy"),

            Title = "Nettkurs Diabetes mellitus type 2",

            Accreditation = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempor interdum purus, at egestas lectus rutrum at. Phasellus semper volutpat ipsum ac bibendum. Nulla placerat interdum nulla nec consequat. Maecenas dictum mattis arcu, sed sagittis risus ornare et. Nunc in tortor et tortor molestie molestie"
        };

        public static CertificateVM From(Certificate c) =>
            new CertificateVM 
            {
                RecipientName = c.RecipientName,
                Title = c.Title,
                CertificateGuid = c.CertificateGuid.ToString(),
                Date = c.IssuedDate.ToString("dd.MMM.yyyy"),
                //IssuerOrganizationName = c.IssuingOrganization?.Name,
                IssuerPersonName = c.IssuedByName,
                //IssuerOrganizationLogoUrl = c.IssuingOrganization?.LogoUrl,
                //City = c.Issuer.IssuedInCity,
                Accreditation = c.Description
            };

    }
}
