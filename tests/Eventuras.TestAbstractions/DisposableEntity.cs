using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.TestAbstractions;

/// <summary>
/// Each newly created entity should be removed from the testing database right after usage, so it would not clash with other DB entities created in
/// other tests. This includes users, events, registrations, and other.
/// </summary>
/// <typeparam name="T"> Entity type </typeparam>
public interface IDisposableEntity<out T> : IDisposable where T : class
{
    public T Entity { get; }

    public Task SaveAsync();
}

public class DisposableEntity<T> : IDisposableEntity<T> where T : class
{
    public T Entity { get; }

    private readonly DbContext _context;

    private readonly IDisposable[] _disposables;

    public DisposableEntity(T entity, DbContext context, params IDisposable[] disposables)
    {
        Entity = entity;
        _context = context;
        _disposables = disposables;
    }

    public void Dispose()
    {
        foreach (var disposable in _disposables) disposable.Dispose();

        try
        {
            _context.Remove(Entity);
            _context.SaveChanges();
        }
        catch (DbUpdateConcurrencyException)
        {
            //  Attempted to update or delete an entity that does not exist in the store.
            _context.Entry(Entity).State = EntityState.Detached;
        }
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class DisposableUser : IDisposableEntity<ApplicationUser>
{
    public ApplicationUser Entity { get; }

    private readonly UserManager<ApplicationUser> _userManager;

    public DisposableUser(ApplicationUser entity, UserManager<ApplicationUser> userManager)
    {
        Entity = entity;
        _userManager = userManager;
    }

    public void Dispose()
    {
        _userManager.DeleteAsync(Entity).Wait();
    }

    public Task SaveAsync()
        =>
            // Stub
            Task.CompletedTask;
}