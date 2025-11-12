using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class ExternalEvent
{
    [Required]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LocalId { get; set; }

    public int EventInfoId { get; set; }

    [Required] public string ExternalServiceName { get; set; }

    [Required] public string ExternalEventId { get; set; }

    [ForeignKey(nameof(EventInfoId))] public EventInfo EventInfo { get; set; }

    public List<ExternalRegistration> Registrations { get; set; }
}
