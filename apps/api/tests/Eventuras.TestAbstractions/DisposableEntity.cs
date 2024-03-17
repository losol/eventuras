using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.TestAbstractions;

/// <summary>
/// Each newly created entity should be removed from the testing database right after usage,
/// so it would not clash with other DB entities created in other tests. This includes users,
/// events, registrations, and other.
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public interface IDisposableEntity<out T> : IDisposable, IAsyncDisposable where T : class
{
    T Entity { get; }
    Task SaveAsync();
}

public class DisposableEntity<T> : IDisposableEntity<T> where T : class
{
    public T Entity { get; }
    private readonly DbContext _context;
    private readonly IDisposable[] _disposables;
    private bool _disposed = false; // To detect redundant calls

    public DisposableEntity(T entity, DbContext context, params IDisposable[] disposables)
    {
        Entity = entity ?? throw new ArgumentNullException(nameof(entity));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _disposables = disposables;
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    // Implement IDisposable.
    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();

        Dispose(disposing: false); // Prevent double dispose.
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                // Dispose managed state (managed objects).
                foreach (var disposable in _disposables)
                {
                    disposable.Dispose();
                }
            }

            _disposed = true;
        }
    }

    protected virtual async ValueTask DisposeAsyncCore()
    {
        // Async dispose managed state (managed objects) if needed.
        foreach (var disposable in _disposables.OfType<IAsyncDisposable>())
        {
            await disposable.DisposeAsync();
        }

        try
        {
            _context.Remove(Entity);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Attempted to update or delete an entity that does not exist in the store.
            _context.Entry(Entity).State = EntityState.Detached;
        }
    }
}

public class DisposableUser : IDisposableEntity<ApplicationUser>
{
    private ApplicationUser _entity;
    private readonly UserManager<ApplicationUser> _userManager;
    private bool _disposed = false;

    public DisposableUser(ApplicationUser entity, UserManager<ApplicationUser> userManager)
    {
        _entity = entity ?? throw new ArgumentNullException(nameof(entity));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    public ApplicationUser Entity => _entity;

    public Task SaveAsync()
    {
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();

        // Perform traditional dispose operations, too, but indicate we're disposing asynchronously.
        Dispose(disposing: false);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            _entity = null;
            _disposed = true;
        }
    }

    protected virtual async ValueTask DisposeAsyncCore()
    {
        if (_entity != null)
        {
            await _userManager.DeleteAsync(_entity);
            _entity = null;
        }
    }
}
