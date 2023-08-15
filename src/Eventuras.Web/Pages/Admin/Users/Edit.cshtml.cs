using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace Eventuras.Web.Pages.Admin.Users;

public class EditModel : PageModel
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IOrganizationMemberManagementService _organizationMemberManagementService;
    private readonly IOrganizationMemberRolesManagementService _memberRolesManagementService;
    private readonly ILogger<EditModel> _logger;

    public EditModel(
        UserManager<ApplicationUser> userManager,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        IOrganizationMemberManagementService organizationMemberManagementService,
        IOrganizationMemberRolesManagementService memberRolesManagementService,
        ILogger<EditModel> logger)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _currentOrganizationAccessorService =
            currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
        _organizationMemberManagementService =
            organizationMemberManagementService ?? throw new ArgumentNullException(nameof(organizationMemberManagementService));
        _memberRolesManagementService = memberRolesManagementService ?? throw new ArgumentNullException(nameof(memberRolesManagementService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [BindProperty]
    public InputModel Input { get; set; }

    public class InputModel
    {
        [Required]
        [Display(Name = "Fullt navn")]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [Display(Name = "Epost")]
        public string Email { get; set; }

        [Display(Name = "Mobilnummer")]
        public string PhoneNumber { get; set; }

        [Display(Name = "Signatur som Base64")]
        public string SignatureImageBase64 { get; set; }

        public bool IsOrgMember { get; set; }
    }

    public Organization Organization { get; set; }

    [BindProperty]
    public Dictionary<string, bool> MemberRoles { get; set; }

    public async Task<IActionResult> OnGetAsync(string id)
    {
        if (id == null) return NotFound();

        return await PageAsync(id);
    }

    public async Task<IActionResult> OnPostAsync(string id)
    {
        if (!ModelState.IsValid) return await PageAsync(id);

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) throw new ApplicationException($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");

        if (Input.Name != user.Name)
        {
            user.Name = Input.Name;
            var setNameResult = await _userManager.UpdateAsync(user);
            if (!setNameResult.Succeeded) throw new ApplicationException($"Unexpected error occurred setting email for user with ID '{user.Id}'.");
        }

        if (Input.Email != user.Email)
        {
            // Set new email address
            var setEmailResult = await _userManager.SetEmailAsync(user, Input.Email);

            // Change username to the new address
            user.UserName = Input.Email;
            var setNameResult = await _userManager.UpdateAsync(user);
            if (!setEmailResult.Succeeded) throw new ApplicationException($"Unexpected error occurred setting email for user with ID '{user.Id}'.");
        }

        if (Input.PhoneNumber != user.PhoneNumber)
        {
            var setPhoneResult = await _userManager.SetPhoneNumberAsync(user, Input.PhoneNumber);
            if (!setPhoneResult.Succeeded)
                throw new ApplicationException($"Unexpected error occurred setting phone number for user with ID '{user.Id}'.");
        }

        if (Input.SignatureImageBase64 != user.SignatureImageBase64)
        {
            user.SignatureImageBase64 = Input.SignatureImageBase64;
            var setSignatureResult = await _userManager.UpdateAsync(user);
            if (!setSignatureResult.Succeeded)
                throw new ApplicationException($"Unexpected error occurred setting email for user with ID '{user.Id}'.");
        }

        try
        {
            if (User.IsInRole(Roles.SuperAdmin))
            {
                if (Input.IsOrgMember)
                {
                    var member = await _organizationMemberManagementService.AddToOrganizationAsync(user);

                    await _memberRolesManagementService.UpdateOrganizationMemberRolesAsync(member.Id,
                        MemberRoles.Where(r => r.Value).Select(r => r.Key).ToArray());
                }
                else { await _organizationMemberManagementService.RemoveFromOrganizationAsync(user); }
            }
        }
        catch (NotAccessibleException e)
        {
            _logger.LogError(e, e.Message);
            return Forbid();
        }

        return RedirectToPage("Index");
    }

    private async Task<IActionResult> PageAsync(string id)
    {
        Organization ??= await _currentOrganizationAccessorService.GetCurrentOrganizationAsync(new OrganizationRetrievalOptions
        {
            LoadHostnames = true,
        });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) throw new ApplicationException($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");

        var orgMember = await _organizationMemberManagementService.FindOrganizationMemberAsync(user,
            Organization,
            new OrganizationMemberRetrievalOptions
            {
                LoadRoles = true,
            });

        Input = new InputModel
        {
            Name = user.Name,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            SignatureImageBase64 = user.SignatureImageBase64,
            IsOrgMember = orgMember != null,
        };

        MemberRoles ??= new Dictionary<string, bool>
        {
            { Roles.Admin, orgMember?.HasRole(Roles.Admin) == true },
        };

        return Page();
    }
}