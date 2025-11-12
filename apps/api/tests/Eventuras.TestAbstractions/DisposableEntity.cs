#nullable enable

using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.TestAbstractions;

/// <summary>
///     Each newly created entity should be removed from the testing database right after usage,
///     so it would not clash with other DB entities created in other tests. This includes users,
///     events, registrations, and other.
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public interface IDisposableEntity<out T> : IDisposable, IAsyncDisposable where T : class
{
    T Entity { get; }
    void Save();
    Task SaveAsync();
    void Delete();
    Task DeleteAsync();
}

public class DisposableEntity<T> : IDisposableEntity<T> where T : class
{
    private readonly DbContext _context;
    private readonly IDisposable[] _disposables;
    private bool _disposed;

    public DisposableEntity(T entity, DbContext context, params IDisposable[] disposables)
    {
        Entity = entity;
        _context = context;
        _disposables = disposables;
    }

    public T Entity { get; }

    public virtual async Task SaveAsync() => await _context.SaveChangesAsync();

    public virtual void Save() => _context.SaveChanges();

    public virtual void Delete()
    {
        _context.Remove(Entity);

        try
        {
            _context.SaveChanges();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Attempted to update or delete an entity that does not exist in the store.
            _context.Entry(Entity).State = EntityState.Detached;
        }
    }

    public virtual async Task DeleteAsync()
    {
        _context.Remove(Entity);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Attempted to update or delete an entity that does not exist in the store.
            _context.Entry(Entity).State = EntityState.Detached;
        }
    }

    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }

        // dispose disposables
        foreach (var disposable in _disposables)
        {
            disposable.Dispose();
        }

        OnDispose();

        _disposed = true;
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed)
        {
            return;
        }

        // dispose disposables in parallel
        var disposeTasks = _disposables.Select(disposable => disposable is IAsyncDisposable asyncDisposable
            ? asyncDisposable.DisposeAsync().AsTask()
            : Task.Run(disposable.Dispose));

        await Task.WhenAll(disposeTasks);
        await OnDisposeAsync();

        _disposed = true;
        GC.SuppressFinalize(this);
    }

    protected virtual void OnDispose() => Delete();

    protected virtual ValueTask OnDisposeAsync() => new(DeleteAsync());
}

public class DisposableUser : DisposableEntity<ApplicationUser>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public DisposableUser(ApplicationUser entity, UserManager<ApplicationUser> userManager) : base(entity, null!) =>
        _userManager = userManager;

    public override Task SaveAsync() => Task.CompletedTask;

    public override void Save() { }

    public override Task DeleteAsync() => _userManager.DeleteAsync(Entity);

    public override void Delete() => _userManager.DeleteAsync(Entity).Wait();
}
