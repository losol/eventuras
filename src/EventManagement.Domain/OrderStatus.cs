using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{
    public class OrderStatus
    {
        [Required]
        public int OrderStatusId { get; set; }

        [Required]
        public string Title {get;set;}
    }
}