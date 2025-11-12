using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class ExternalAccount
{
    [Required]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LocalId { get; set; }

    [Required] public string ExternalServiceName { get; set; }

    [Required] public string ExternalAccountId { get; set; }

    [Required] public string DisplayName { get; set; }

    public int? RegistrationId { get; set; }

    public string UserId { get; set; }

    [ForeignKey(nameof(RegistrationId))] public Registration Registration { get; set; }

    [ForeignKey(nameof(UserId))] public ApplicationUser User { get; set; }

    public List<ExternalRegistration> ExternalRegistrations { get; set; }
}
