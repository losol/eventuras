using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services;

namespace Eventuras.WebApi.Models;

public class PageResponseDto<T>
{
    public PageResponseDto()
    {
    }

    public PageResponseDto(PageQueryDto query) : this()
    {
        Page = query.Page;
        Count = query.Count;
    }

    public int Page { get; set; }

    public int Count { get; set; }

    public int Total { get; set; }

    public int Pages => Count > 0 ? (int)Math.Ceiling(Total / (double)Count) : 0;

    public T[] Data { get; set; } = Array.Empty<T>();

    public static PageResponseDto<TR> FromPaging<TD, TR>(PageQueryDto query, Paging<TD> paging, Func<TD, TR> f) =>
        new(query) { Total = paging.TotalRecords, Data = paging.Data.Select(f).ToArray() };

    public static async Task<PageResponseDto<TR>> FromPagingAsync<TD, TR>(
        PageQueryDto query,
        Paging<TD> paging,
        Func<TD, Task<TR>> f,
        CancellationToken cancellationToken = default)
    {
        // Map one at a time: mappers may share a scoped DbContext, which is not thread-safe.
        var data = new TR[paging.Data.Length];
        for (var i = 0; i < paging.Data.Length; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            data[i] = await f(paging.Data[i]);
        }

        return new PageResponseDto<TR>(query) { Total = paging.TotalRecords, Data = data };
    }
}
