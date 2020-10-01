using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Web.Pages.Admin.Users
{
    public class CreateModel : PageModel
    {
        private readonly IOrganizationMemberRolesManagementService _memberRolesManagementService;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly IOrganizationMemberManagementService _organizationMemberManagementService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<CreateModel> _logger;

        public CreateModel(
            IOrganizationMemberRolesManagementService memberRolesManagementService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IOrganizationMemberManagementService organizationMemberManagementService,
            UserManager<ApplicationUser> userManager,
            ILogger<CreateModel> logger)
        {
            _memberRolesManagementService = memberRolesManagementService ?? throw new ArgumentNullException(nameof(memberRolesManagementService));
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
            _organizationMemberManagementService = organizationMemberManagementService ?? throw new ArgumentNullException(nameof(organizationMemberManagementService));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public string StatusMessage { get; set; }

        [BindProperty]
        public InputModel Input { get; set; }

        public Organization Organization { get; set; }

        [BindProperty]
        public Dictionary<string, bool> MemberRoles { get; set; }

        public class InputModel
        {
            [Display(Name = "Navn", Description = "Hele navnet til brukeren")]
            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            public string Name { get; set; }

            [Display(Name = "Epost", Description = "Epost til bruker")]
            [Required]
            [EmailAddress]
            public string Email { get; set; }

            [Display(Name = "Landkode", Description = "Landkode")]
            [StringLength(10, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 2)]
            public string PhoneCountryCode { get; set; } = "+47";

            [Display(Name = "Mobiltelefon", Description = "Epost til bruker")]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 5)]
            public string PhoneNumber { get; set; }

            public bool IsOrgMember { get; set; } = true;
        }

        public async Task<IActionResult> OnGet()
        {
            Input = new InputModel();
            return await PageAsync();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return await PageAsync();
            }

            var user = new ApplicationUser { Name = Input.Name, UserName = Input.Email, Email = Input.Email, PhoneNumber = (Input.PhoneCountryCode + Input.PhoneNumber) };
            await _userManager.CreateAsync(user);

            try
            {
                if (User.IsInRole(Roles.SuperAdmin))
                {
                    // Only SuperAdmin can choose whether to associate user with org,
                    // Admins can only create org members.

                    if (Input.IsOrgMember)
                    {
                        var member = await _organizationMemberManagementService.AddToOrganizationAsync(user);

                        await _memberRolesManagementService.UpdateOrganizationMemberRolesAsync(member.Id,
                            MemberRoles.Where(r => r.Value)
                                .Select(r => r.Key)
                                .ToArray());
                    }
                }
                else
                {
                    await _organizationMemberManagementService.AddToOrganizationAsync(user);
                }
            }
            catch (AccessViolationException e)
            {
                _logger.LogError(e, e.Message);
                return Forbid();
            }

            return RedirectToPage("./Index");
        }

        private async Task<IActionResult> PageAsync()
        {
            Organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync(new OrganizationRetrievalOptions
            {
                LoadHostnames = true
            });

            MemberRoles ??= new Dictionary<string, bool> { { Roles.Admin, false } };

            return Page();
        }
    }
}
