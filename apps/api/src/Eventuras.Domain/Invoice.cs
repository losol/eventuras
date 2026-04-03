using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class Invoice
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int InvoiceId { get; set; }
    public Guid Uuid { get; set; } = Guid.CreateVersion7();

    public string ExternalInvoiceId { get; set; }

    public bool Paid { get; set; }

    public List<Order> Orders { get; set; } = new();
}
