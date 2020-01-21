using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services
{
    public class Paging<T>
    {
        public T[] Data { get; }
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
