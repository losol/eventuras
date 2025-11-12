using System;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services;

public static class DbContextLoggingHelper
{
    public static void LogPendingChanges(DbContext context)
    {
        foreach (var entry in context.ChangeTracker.Entries())
        {
            var entityType = entry.Entity.GetType().Name;
            if (entry.State == EntityState.Added)
            {
                Debug.WriteLine($"Adding a new entity of type {entityType}");
            }
            else if (entry.State == EntityState.Modified)
            {
                Debug.WriteLine($"Modifying an existing entity of type {entityType}");

                // Log specific property changes
                foreach (var prop in entry.OriginalValues.Properties)
                {
                    var original = entry.OriginalValues[prop];
                    var current = entry.CurrentValues[prop];
                    if (!Equals(original, current))
                    {
                        Debug.WriteLine($"Property {prop.Name} changed from {original} to {current}");
                    }
                }
            }
            else if (entry.State == EntityState.Deleted)
            {
                Debug.WriteLine($"Deleting an entity of type {entityType}");
            }

            // Log navigation properties if needed
            foreach (var nav in entry.Navigations)
            {
                Debug.WriteLine($"Navigation property {nav.Metadata.Name} has been loaded: {nav.IsLoaded}");
            }

            // Log timestamp
            Debug.WriteLine($"Change detected at {DateTime.UtcNow}");
        }

        // Log stack trace if needed
        Debug.WriteLine(Environment.StackTrace);
    }
}
