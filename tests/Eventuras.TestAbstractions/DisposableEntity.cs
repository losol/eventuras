using System;
using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.TestAbstractions
{
    /// <summary>
    /// Each newly created entity should be removed from the testing database right after usage,
    /// so it would not clash with other DB entities created in other tests. This includes users,
    /// events, registrations, and other.
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public interface IDisposableEntity<out T> : IDisposable where T : class
    {
        public T Entity { get; }
    }

    public class DisposableEntity<T> : IDisposableEntity<T> where T : class
    {
        public T Entity { get; }

        private readonly DbContext _context;

        public DisposableEntity(T entity, DbContext context)
        {
            Entity = entity;
            _context = context;
        }

        public void Dispose()
        {
            _context.Remove(Entity);
            _context.SaveChanges();
        }
    }

    public class DisposableUser : IDisposableEntity<ApplicationUser>
    {
        public ApplicationUser Entity { get; }

        private readonly UserManager<ApplicationUser> _userManager;

        public DisposableUser(
            ApplicationUser entity,
            UserManager<ApplicationUser> userManager)
        {
            Entity = entity;
            _userManager = userManager;
        }

        public void Dispose()
        {
            _userManager.DeleteAsync(Entity).Wait();
        }
    }
}
