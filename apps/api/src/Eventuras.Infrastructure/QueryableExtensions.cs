#nullable enable

using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace Eventuras.Infrastructure;

public static class QueryableExtensions
{
    public static IOrderedQueryable<TEntity> OrderByColumn<TEntity>(this IQueryable<TEntity> query, string columnName)
    {
        var expression = GetPropertyAccessExpression<TEntity>(columnName);
        return query.OrderBy(expression);
    }

    public static IOrderedQueryable<TEntity> ThenByColumn<TEntity>(this IOrderedQueryable<TEntity> query,
        string columnName)
    {
        var expression = GetPropertyAccessExpression<TEntity>(columnName);
        return query.ThenBy(expression);
    }

    public static IOrderedQueryable<TEntity> OrderByColumnDescending<TEntity>(this IQueryable<TEntity> query,
        string columnName)
    {
        var expression = GetPropertyAccessExpression<TEntity>(columnName);
        return query.OrderByDescending(expression);
    }

    public static IOrderedQueryable<TEntity> ThenByColumnDescending<TEntity>(this IOrderedQueryable<TEntity> query,
        string columnName)
    {
        var expression = GetPropertyAccessExpression<TEntity>(columnName);
        return query.ThenByDescending(expression);
    }

    /// <summary>
    ///     Sorts query by multiple columns.
    /// </summary>
    /// <param name="query">Query to sort.</param>
    /// <param name="defaultOrder">Default order by expression, if <paramref name="ordering" /> is an empty array.</param>
    /// <param name="defaultOrderDescending">Default order direction.</param>
    /// <param name="ordering">List of sort parameters.</param>
    /// <typeparam name="TEntity">Type of the entity.</typeparam>
    /// <returns>Sorted query.</returns>
    public static IOrderedQueryable<TEntity> OrderByColumns<TEntity>(
        this IQueryable<TEntity> query,
        Expression<Func<TEntity, object?>> defaultOrder,
        bool defaultOrderDescending,
        (string ColumnName, bool Descending)[] ordering)
    {
        if (ordering.Length == 0)
        {
            return defaultOrderDescending ? query.OrderByDescending(defaultOrder) : query.OrderBy(defaultOrder);
        }

        IOrderedQueryable<TEntity> oq = null!;
        var first = true;

        foreach (var order in ordering)
        {
            if (first)
            {
                oq = order.Descending
                    ? query.OrderByColumnDescending(order.ColumnName)
                    : query.OrderByColumn(order.ColumnName);
                first = false;
            }
            else
            {
                oq = order.Descending ? oq.ThenByColumnDescending(order.ColumnName) : oq.ThenByColumn(order.ColumnName);
            }
        }

        return oq;
    }

    public static IOrderedQueryable<TEntity> OrderByColumns<TEntity>(
        this IQueryable<TEntity> query,
        Expression<Func<TEntity, object?>> defaultOrder,
        bool defaultOrderDescending,
        string[] columnsAndDirections)
    {
        var ordering = new (string, bool)[columnsAndDirections.Length];
        for (var i = 0; i < columnsAndDirections.Length; i++)
        {
            ordering[i] = SplitColumnNameAndOrderDirection(columnsAndDirections[i]);
        }

        return OrderByColumns(query, defaultOrder, defaultOrderDescending, ordering);
    }

    /// <summary>
    ///     Splits mixed column name and order direction in separate parameters.
    /// </summary>
    /// <remarks>
    ///     Column name is extracted from string until last column (":" symbol).
    ///     Order direction will be descending only if string ends in ":desc" or ":descending".
    /// </remarks>
    /// <param name="columnAndDirection">Mixed information on sorting. Allowed format: "(columnName)[:(desc|descending)]".</param>
    /// <returns>Parameters for sorting.</returns>
    public static (string ColumnName, bool Descending) SplitColumnNameAndOrderDirection(string columnAndDirection)
    {
        // sanitize whitespaces
        var trimmed = columnAndDirection.AsSpan().Trim();

        // check if string has ":"
        var columnIndex = trimmed.LastIndexOf(':');
        if (columnIndex == -1)
        {
            return (columnAndDirection, false);
        }

        // check last word is ":desc" or ":descending"
        var ending = trimmed[(columnIndex + 1)..];
        var descending = ending.Equals("desc", StringComparison.InvariantCultureIgnoreCase)
                         || ending.Equals("descending", StringComparison.InvariantCultureIgnoreCase);

        return (trimmed[..columnIndex].ToString(), descending);
    }

    private static Expression<Func<TEntity, object>> GetPropertyAccessExpression<TEntity>(string propertyName)
    {
        var parameter = Expression.Parameter(typeof(TEntity), "entity");
        var property = typeof(TEntity).GetProperty(propertyName,
            BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

        if (property == null)
        {
            throw new ArgumentException(
                $"Property with name '{propertyName}' was not found on type '{typeof(TEntity)}'.");
        }

        var propertyAccess = Expression.Property(parameter, property);
        var convert = Expression.Convert(propertyAccess, typeof(object));
        return Expression.Lambda<Func<TEntity, object>>(convert, parameter);
    }
}
