#nullable enable

using Eventuras.Domain;
using static Eventuras.Domain.Registration;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

/// <summary>
///     DTO for partial updates to a registration.
///     Only allows updating Status, Type, and Notes fields.
/// </summary>
public class RegistrationPatchDto
{
    /// <summary>
    ///     The registration status.
    /// </summary>
    public RegistrationStatus? Status { get; set; }

    /// <summary>
    ///     The registration type.
    /// </summary>
    public RegistrationType? Type { get; set; }

    /// <summary>
    ///     Notes about the registration.
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    ///     Applies the changes from this DTO to a Registration entity.
    /// </summary>
    /// <param name="registration">The registration to update</param>
    public void ApplyTo(Registration registration)
    {
        if (Status.HasValue)
        {
            registration.Status = Status.Value;
            registration.AddLog($"Status updated to {Status.Value}");
        }

        if (Type.HasValue)
        {
            registration.Type = Type.Value;
            registration.AddLog($"Type updated to {Type.Value}");
        }

        if (Notes != null)
        {
            registration.Notes = Notes;
        }
    }
}
