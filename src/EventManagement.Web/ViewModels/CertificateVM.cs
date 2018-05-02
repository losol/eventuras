using System;
using System.Collections.Generic;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Web.ViewModels
{
    public class CertificateVM
    {
        public string CertificateGuid { get; set; }

        public string Title { get;set; } 
        public string Description { get;set; }

        public string RecipientName {get;set;}

        public string EvidenceDescription { get; set;}
        public List<CertificateEvidence> Evidence {get;set;}

        public string IssuedInCity { get; set; }
        public string IssuingDate { get; set; }

        public string IssuerOrganizationName {get;set;}
        public string IssuerOrganizationLogoBase64 { get; set; }
        
        public string IssuerPersonName {get;set;}
        public string IssuerPersonSignatureImageBase64 { get; set; }
        

        public static CertificateVM Mock => new CertificateVM 
        {
            RecipientName = "Gerhard Henrik Armauer Hansen",
            IssuerOrganizationName = "Nordland Legeforening",
            IssuerPersonName = "Tove Myrbakk",

            //EventDateStart = DateTime.Now.AddDays(-7),
            CertificateGuid = Guid.NewGuid().ToString(),
            IssuedInCity = "Bodø",
            IssuingDate = DateTime.Now.ToString("dd.MM.yyyy"),

            Title = "Nettkurs Diabetes mellitus type 2",
            Description = "Lorem ipsum dolor amet master cleanse ennui brunch truffaut copper mug, roof party skateboard chillwave live-edge activated charcoal ethical schlitz next level tumeric.",
            
             };

        public static CertificateVM From(Certificate c) =>
            new CertificateVM 
            {
                CertificateGuid = c.CertificateGuid.ToString(),

                Title = c.Title,
                Description = c.Description,

                RecipientName = c.RecipientName,

                Evidence = c.Evidence,

                IssuedInCity = c.IssuedInCity,
                IssuingDate = c.IssuedDate.ToString("dd.MMM.yyyy"),
                
                IssuerOrganizationName = c.IssuingOrganization.Name,
                IssuerOrganizationLogoBase64 = c.IssuingOrganization.LogoBase64,
                
                IssuerPersonName = c.IssuedByName,
                IssuerPersonSignatureImageBase64 = c.IssuingUser.SignatureImageBase64
            };

    }
}
