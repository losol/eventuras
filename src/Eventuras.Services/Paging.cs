using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

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

        public static async Task<Paging<TP>> CreateAsync<TP>(
            IQueryable<TP> query,
            PagingRequest request,
            CancellationToken cancellationToken = default)
        {
            var count = await query.CountAsync(cancellationToken);
            var data = await query
                .Skip(request.Offset)
                .Take(request.Limit)
                .ToArrayAsync(cancellationToken);
            return new Paging<TP>(data, count);
        }

        public static Paging<TP> Empty<TP>()
        {
            return new Paging<TP>(new TP[0], 0);
        }
    }
}
