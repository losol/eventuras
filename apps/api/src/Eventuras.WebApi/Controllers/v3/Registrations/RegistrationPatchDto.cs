#nullable enable

using Eventuras.Domain;
using static Eventuras.Domain.PaymentMethod;
using static Eventuras.Domain.Registration;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

/// <summary>
///     DTO for partial updates to a registration (JSON Merge Patch semantics).
///
///     Only fields present in the request body are applied. Nullable string
///     fields set to <c>null</c> clear the corresponding entity value.
///     Omitted fields are left untouched. Sending <c>null</c> on non-nullable
///     fields (status/type/paymentMethod) is rejected with a 400 by the JSON
///     deserializer.
///
///     Presence is tracked via property setters: the JSON deserializer only
///     invokes a setter when the field is in the payload, so a dedicated
///     backing flag can distinguish "absent" from "explicit null".
/// </summary>
public class RegistrationPatchDto
{
    private RegistrationStatus _status;
    private bool _statusSet;
    /// <summary>The registration status.</summary>
    public RegistrationStatus Status
    {
        get => _status;
        set { _status = value; _statusSet = true; }
    }

    private RegistrationType _type;
    private bool _typeSet;
    /// <summary>The registration type.</summary>
    public RegistrationType Type
    {
        get => _type;
        set { _type = value; _typeSet = true; }
    }

    private string? _notes;
    private bool _notesSet;
    /// <summary>Notes about the registration. Explicit null clears the field.</summary>
    public string? Notes
    {
        get => _notes;
        set { _notes = value; _notesSet = true; }
    }

    private PaymentProvider _paymentMethod;
    private bool _paymentMethodSet;
    /// <summary>Payment method for the registration.</summary>
    public PaymentProvider PaymentMethod
    {
        get => _paymentMethod;
        set { _paymentMethod = value; _paymentMethodSet = true; }
    }

    private string? _certificateComment;
    private bool _certificateCommentSet;
    /// <summary>Comment shown on the certificate. Explicit null clears the field.</summary>
    public string? CertificateComment
    {
        get => _certificateComment;
        set { _certificateComment = value; _certificateCommentSet = true; }
    }

    private string? _customerVatNumber;
    private bool _customerVatNumberSet;
    /// <summary>Customer VAT number for invoicing. Explicit null clears the field.</summary>
    public string? CustomerVatNumber
    {
        get => _customerVatNumber;
        set { _customerVatNumber = value; _customerVatNumberSet = true; }
    }

    private string? _customerInvoiceReference;
    private bool _customerInvoiceReferenceSet;
    /// <summary>Customer invoice reference. Explicit null clears the field.</summary>
    public string? CustomerInvoiceReference
    {
        get => _customerInvoiceReference;
        set { _customerInvoiceReference = value; _customerInvoiceReferenceSet = true; }
    }

    /// <summary>Applies the changes from this DTO to a Registration entity.</summary>
    public void ApplyTo(Registration registration)
    {
        if (_statusSet)
        {
            registration.Status = Status;
        }

        if (_typeSet)
        {
            registration.Type = Type;
        }

        if (_paymentMethodSet)
        {
            registration.PaymentMethod = PaymentMethod;
        }

        if (_notesSet)
        {
            registration.Notes = Notes;
        }

        if (_certificateCommentSet)
        {
            registration.CertificateComment = CertificateComment;
        }

        if (_customerVatNumberSet)
        {
            registration.CustomerVatNumber = CustomerVatNumber;
        }

        if (_customerInvoiceReferenceSet)
        {
            registration.CustomerInvoiceReference = CustomerInvoiceReference;
        }
    }
}
