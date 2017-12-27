using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Models
{
    public class Person
    {
        public int PersonId { get; set; }

        [Required]
        [StringLength(75)]
        [Display(Name = "Navn")]
        public string Name { get; set; }

        public int UserId { get; set; }

        public string Email { get; set; }
        public string Phone { get; set; }


    }
}
