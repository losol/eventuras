using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Data;

namespace losol.EventManagement.Models
{
    public enum RegistrationType
    {
        Instructor, 
        Learner, 
        Volunteer
    }
    public enum PaymentMethod
    {
        Card, 
        E_mail_invoice, 
        EHF_invoice
    }

    public class Registration
    {
        public int RegistrationId { get; set; }
        public int EventInfoId { get; set; }
        public string UserId { get; set; }

        public RegistrationType? RegistrationType { get; set; }

        [Display(Name = "Møtt?")]
        public bool Attended { get; set; } = false;

        [Display(Name = "Skal ha kursdiplom?")]
        public bool Diploma { get; set; } = true;

        [Display(Name = "Kommentar")]
        [DataType(DataType.MultilineText)]
        public string Notes { get; set; }

        public DateTime? RegistrationTime { get; set; }
        public string RegistrationBy { get; set; }

        // Navigation properties
        public EventInfo EventInfo { get; set; }
        public ApplicationUser User { get; set; }

    }
}
