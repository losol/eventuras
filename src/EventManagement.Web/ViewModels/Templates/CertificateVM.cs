using System;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Web.ViewModels.Templates
{
    public class CertificateVM
    {
        public string CertificateGuid { get; set; }

        public string Title {get;set;} 


        public string RecipientName {get;set;}
        public string IssuerOrganizationName {get;set;}
        public string IssuerOrganizationLogoUrl {get;set;}
        public string IssuerPersonName {get;set;}

        public string City { get; set; }
        public string Date { get; set; }

        public static CertificateVM Mock => new CertificateVM 
        {
            RecipientName = "Angela Moss",
            IssuerOrganizationName = "E Corp",
            IssuerOrganizationLogoUrl = "http://www.ecorpclient.com/newlogo.png",
            IssuerPersonName = "Phillip Price",

            CertificateGuid = Guid.NewGuid().ToString(),
            City = "San Diego",
            Date = DateTime.Now.ToString("dd.MM.yyyy"),

            Title = "Nettkurs Diabetes mellitus type 2"
        };

        public static CertificateVM From(Certificate c) =>
            new CertificateVM 
            {
                RecipientName = c.RecipientName,
                Title = c.Title,
                CertificateGuid = c.CertificateGuid.ToString(),
                Date = c.CreatedOn.ToString("dd.MMM.yyyy"),
                IssuerOrganizationName = c.Issuer.OrganizationName,
                IssuerPersonName = c.Issuer.IssuedByName,
                IssuerOrganizationLogoUrl = c.Issuer.OrganizationLogoUrl,
                City = c.Issuer.IssuedInCity
            };

    }
}
