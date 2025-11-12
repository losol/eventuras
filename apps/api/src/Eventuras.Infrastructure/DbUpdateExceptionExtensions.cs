using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Eventuras.Infrastructure;

public static class DbUpdateExceptionExtensions
{
    private const string ForeignKeyViolation = "23503";
    private const string UniqueViolation = "23505";

    public static string GetSqlStateCode(this DbUpdateException e)
    {
        var postgresException = e.InnerException as PostgresException
                                ?? e.InnerException?.InnerException as PostgresException;
        return postgresException?.SqlState;
    }

    public static bool IsForeignKeyViolation(this DbUpdateException e) => e.GetSqlStateCode() == ForeignKeyViolation;

    public static bool IsUniqueKeyViolation(this DbUpdateException e) => e.GetSqlStateCode() == UniqueViolation;
}
