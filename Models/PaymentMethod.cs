using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Models
{
    public class PaymentMethod
    {
        public int PaymentMethodId { get; set; }

		public string Code {get;set;}

        [Required]
        [StringLength(75)]
        [Display(Name = "Navn på betalingsmetode")]
        public string Name { get; set; }

		public bool Active {get;set;} = false;

    }
}
