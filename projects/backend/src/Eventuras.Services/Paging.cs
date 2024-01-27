using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services
{
    public class Paging<T>
    {
        /// <summary>
        /// Data for this page.
        /// </summary>
        public T[] Data { get; }

        /// <summary>
        /// Total of records for this query.
        /// </summary>
        public int TotalRecords { get; }

        public Paging(T[] data, int totalRecords)
        {
            Data = data;
            TotalRecords = totalRecords;
        }
    }

    public static class Paging
    {
        public static async Task<Paging<T>> CreateAsync<T>(
            IQueryable<T> query,
            PagingRequest request,
            CancellationToken cancellationToken = default)
        {
            var count = await query.CountAsync(cancellationToken);
            var data = count == 0 ? Array.Empty<T>() : await query.Skip(request.Offset).Take(request.Limit).ToArrayAsync(cancellationToken);

            return new Paging<T>(data, count);
        }

        public static Paging<T> Create<T>(IQueryable<T> query, PagingRequest request)
        {
            var count = query.Count();
            var data = count == 0 ? Array.Empty<T>() : query.Skip(request.Offset).Take(request.Limit).ToArray();

            return new Paging<T>(data, count);
        }

        public static Paging<T> Empty<T>()
        {
            return new Paging<T>(Array.Empty<T>(), 0);
        }
    }
}