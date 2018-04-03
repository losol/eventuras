using System;

namespace losol.EventManagement.Web.ViewModels.Templates.Certificates
{
    public class CourseCertificateVM
    {
        public string CertificateGuid { get; set; }

        public string Title {get;set;} 


        public string RecipientName {get;set;}
        public string IssuerOrganizationName {get;set;}
        public string IssuerOrganizationLogoUrl {get;set;}
        public string IssuerPersonName {get;set;}

        public string City { get; set; }
        public string Date { get; set; }

        public static CourseCertificateVM Mock => new CourseCertificateVM 
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
    }
}
