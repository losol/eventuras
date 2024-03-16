#nullable enable

using System;
using System.Linq;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Invoices;

public class InvoiceRequestDto
{
    public int[] OrderIds { get; set; } = null!;
}
