using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services;

public static class DbContextLoggingHelper
{
    public static void LogPendingChanges(DbContext context, ILogger logger)
    {
        foreach (var entry in context.ChangeTracker.Entries())
        {
            var entityType = entry.Entity.GetType().Name;

            switch (entry.State)
            {
                case EntityState.Added:
                    logger.LogDebug("Adding a new entity of type {EntityType}", entityType);
                    break;
                case EntityState.Modified:
                    logger.LogDebug("Modifying an existing entity of type {EntityType}", entityType);
                    foreach (var prop in entry.OriginalValues.Properties)
                    {
                        var original = entry.OriginalValues[prop];
                        var current = entry.CurrentValues[prop];
                        if (!Equals(original, current))
                        {
                            logger.LogDebug("Property {PropertyName} changed from {OriginalValue} to {CurrentValue}",
                                prop.Name, original, current);
                        }
                    }
                    break;
                case EntityState.Deleted:
                    logger.LogDebug("Deleting an entity of type {EntityType}", entityType);
                    break;
            }
        }
    }
}
