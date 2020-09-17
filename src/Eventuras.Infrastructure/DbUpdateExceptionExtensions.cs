using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Eventuras.Infrastructure
{
    public static class DbUpdateExceptionExtensions
    {
        public static bool IsUniqueKeyViolation(this DbUpdateException e)
        {
            var postgresException = e.InnerException as PostgresException
                                    ?? e.InnerException?.InnerException as PostgresException;
            if (postgresException != null)
                // https://www.postgresql.org/docs/current/static/errcodes-appendix.html
                switch (postgresException.SqlState)
                {
                    case "23505": // Unique constraint error
                        return true;
                }

            return false;
        }
    }
}
