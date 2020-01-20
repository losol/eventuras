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

        public static async Task<Paging<T>> CreateAsync<T>(
            IQueryable<T> query,
            PagingRequest request,
            CancellationToken cancellationToken = default)
        {
            var count = await query.CountAsync(cancellationToken);
            var data = await query
                .Skip(request.Offset)
                .Take(request.Limit)
                .ToArrayAsync(cancellationToken);
            return new Paging<T>(data, count);
        }

        public static Paging<T> Empty()
        {
            return new Paging<T>(new T[0], 0);
        }
    }
}
