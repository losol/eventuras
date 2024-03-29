using System;
using System.Linq;
using Eventuras.Services;

namespace Eventuras.WebApi.Models;

public class PageResponseDto<T>
{
    public int Page { get; set; }

    public int Count { get; set; }

    public int Total { get; set; }

    public int Pages => Count > 0 ? (int)Math.Ceiling(Total / (double)Count) : 0;

    public T[] Data { get; set; } = Array.Empty<T>();

    public PageResponseDto()
    {
    }

    public PageResponseDto(PageQueryDto query) : this()
    {
        Page = query.Page;
        Count = query.Count;
    }

    public static PageResponseDto<TR> FromPaging<TD, TR>(PageQueryDto query, Paging<TD> paging, Func<TD, TR> f)
    {
        return new PageResponseDto<TR>(query)
        {
            Total = paging.TotalRecords,
            Data = paging.Data.Select(f).ToArray()
        };
    }
}
