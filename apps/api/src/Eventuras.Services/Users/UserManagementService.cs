using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Users;

public class UserManagementService : IUserManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserManagementService> _logger;
    private readonly IUserAccessControlService _userAccessControlService;

    public UserManagementService(
        ApplicationDbContext context,
        ILogger<UserManagementService> logger,
        IUserAccessControlService userAccessControlService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _userAccessControlService = userAccessControlService ??
                                    throw new ArgumentNullException(nameof(userAccessControlService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ApplicationUser> CreateNewUserAsync(
        string email,
        string phoneNumber = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("CreateNewUserAsync started.");

        if (string.IsNullOrEmpty(email))
        {
            _logger.LogWarning("CreateNewUserAsync called with empty email.");
            throw new ArgumentException("User should have an email.", nameof(email));
        }

        var normalizedEmail = email.ToUpperInvariant();

        // Match on NormalizedUserName as well as NormalizedEmail: the unique key
        // is NormalizedUserName, and a user's stored email can drift from it, so
        // an email-only check would miss them and let the INSERT below blow up on
        // the AspNetUsers_NormalizedUserName_key constraint.
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(
                u => u.NormalizedEmail == normalizedEmail || u.NormalizedUserName == normalizedEmail,
                cancellationToken);

        if (existingUser != null)
        {
            throw DuplicateUserException(existingUser, email);
        }

        var user = new ApplicationUser
        {
            UserName = email,
            NormalizedUserName = normalizedEmail,
            Email = email,
            NormalizedEmail = normalizedEmail,
            PhoneNumber = phoneNumber
        };

        _context.Users.Add(user);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
        {
            // A concurrent request inserted a user with the same username/email
            // between the check above and SaveChanges. Surface a clean
            // DuplicateException instead of leaking the raw DbUpdateException (500).
            // Non-unique failures bubble up unchanged via the exception filter.
            _context.Entry(user).State = EntityState.Detached;
            var racedUser = await _context.Users
                .FirstOrDefaultAsync(
                    u => u.NormalizedEmail == normalizedEmail || u.NormalizedUserName == normalizedEmail,
                    cancellationToken);
            if (racedUser == null)
            {
                throw;
            }

            throw DuplicateUserException(racedUser, email);
        }

        _logger.LogDebug("CreateNewUserAsync finished.");
        return user;
    }

    public async Task<ApplicationUser> GetOrCreateUserByEmailAsync(
        string email,
        string phoneNumber = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(email))
        {
            throw new ArgumentException("User should have an email.", nameof(email));
        }

        var normalizedEmail = email.ToUpperInvariant();

        var existingUser = await FindUserByEmailOrUserNameAsync(normalizedEmail, cancellationToken);
        if (existingUser != null)
        {
            await RealignNormalizedEmailAsync(existingUser, email, normalizedEmail, cancellationToken);
            return existingUser;
        }

        try
        {
            return await CreateNewUserAsync(email, phoneNumber, cancellationToken);
        }
        catch (DuplicateException)
        {
            // The user exists but the initial lookup missed it (username/email
            // drift, or a concurrent request created it). Re-resolve and return
            // instead of failing the profile request.
            var racedUser = await FindUserByEmailOrUserNameAsync(normalizedEmail, cancellationToken);
            if (racedUser == null)
            {
                throw;
            }

            await RealignNormalizedEmailAsync(racedUser, email, normalizedEmail, cancellationToken);
            return racedUser;
        }
    }

    private Task<ApplicationUser> FindUserByEmailOrUserNameAsync(
        string normalizedEmail,
        CancellationToken cancellationToken) =>
        _context.Users
            .Include(u => u.OrganizationMembership)
            .ThenInclude(m => m.Roles)
            .FirstOrDefaultAsync(
                u => u.NormalizedEmail == normalizedEmail || u.NormalizedUserName == normalizedEmail,
                cancellationToken);

    private async Task RealignNormalizedEmailAsync(
        ApplicationUser user,
        string email,
        string normalizedEmail,
        CancellationToken cancellationToken)
    {
        if (user.NormalizedEmail == normalizedEmail)
        {
            return;
        }

        // The user was matched by username while their stored email had drifted.
        // Don't realign if another user already owns this address (the email
        // index is non-unique, but GetUserByEmailAsync expects a single match).
        var emailTaken = await _context.Users
            .AnyAsync(u => u.Id != user.Id && u.NormalizedEmail == normalizedEmail, cancellationToken);
        if (emailTaken)
        {
            _logger.LogWarning(
                "Skipped realigning email for user {UserId}: address already used by another user.", user.Id);
            return;
        }

        _logger.LogWarning("Realigning drifted email for user {UserId}.", user.Id);
        user.Email = email;
        user.NormalizedEmail = normalizedEmail;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private DuplicateException DuplicateUserException(ApplicationUser existingUser, string email)
    {
        if (existingUser.Archived)
        {
            _logger.LogWarning("Found archived user with email {email}. Contact admin to unarchive the user.",
                email);
            return new DuplicateException(
                $"An archived user with email {email} already exists. Contact admin to unarchive the user.");
        }

        _logger.LogWarning("Found existing user with email {email}.", email);
        return new DuplicateException($"A user with email {email} already exists.");
    }

    public async Task UpdateUserAsync(ApplicationUser user,
        CancellationToken cancellationToken = default)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        // Allow users to update their own information, and admins to update any user
        await _userAccessControlService.CheckOwnerOrAdminAccessAsync(user, cancellationToken);

        var normalizedEmail = user.Email?.ToUpperInvariant();
        if (await _context.Users.AnyAsync(u => !u.Archived && u.NormalizedEmail == normalizedEmail && u.Id != user.Id,
                cancellationToken))
        {
            _logger.LogWarning("User with email {Email} already exists.", user.Email);
            throw new DuplicateException($"User with email {user.Email} already exists.");
        }

        user.NormalizedEmail = normalizedEmail;
        user.NormalizedUserName = normalizedEmail;

        await _context.UpdateAsync(user, cancellationToken);
    }
}
