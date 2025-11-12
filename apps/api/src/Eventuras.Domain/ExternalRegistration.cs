using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class ExternalRegistration
{
    [Required]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LocalId { get; set; }

    public string
        ExternalRegistrationId
    { get; set; } // optional, some external services may not return registration id

    public int ExternalEventId { get; set; }

    public int ExternalAccountId { get; set; }

    public int RegistrationId { get; set; }

    [ForeignKey(nameof(ExternalEventId))] public ExternalEvent ExternalEvent { get; set; }

    [ForeignKey(nameof(ExternalAccountId))]
    public ExternalAccount ExternalAccount { get; set; }

    [ForeignKey(nameof(RegistrationId))] public Registration Registration { get; set; }
}
