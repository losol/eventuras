#nullable enable

using Eventuras.Domain;
using System;
using System.Linq;

namespace Eventuras.WebApi.Controllers.v3.Invoices
{
    public class InvoiceRequestDto
    {
        public int[] OrderIds { get; set; } = null!;
    }
}
