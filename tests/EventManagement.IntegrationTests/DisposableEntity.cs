using System;
using losol.EventManagement.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.IntegrationTests
{
    public interface IDisposableEntity<out T> : IDisposable where T : class
    {
        public T Entity { get; }
    }

    public class DisposableEntity<T> : IDisposableEntity<T> where T : class
    {
        public T Entity { get; }

        private readonly DbContext context;

        public DisposableEntity(T entity, DbContext context)
        {
            this.Entity = entity;
            this.context = context;
        }

        public void Dispose()
        {
            this.context.Remove(this.Entity);
            this.context.SaveChanges();
        }
    }

    public class DisposableUser : IDisposableEntity<ApplicationUser>
    {
        public ApplicationUser Entity { get; }

        private readonly UserManager<ApplicationUser> userManager;

        public DisposableUser(
            ApplicationUser entity,
            UserManager<ApplicationUser> userManager)
        {
            this.Entity = entity;
            this.userManager = userManager;
        }

        public void Dispose()
        {
            this.userManager.DeleteAsync(this.Entity).Wait();
        }
    }
}
