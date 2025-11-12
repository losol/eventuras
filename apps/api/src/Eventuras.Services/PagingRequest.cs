#nullable enable

using System;

namespace Eventuras.Services;

public class PagingRequest
{
    /// <summary>
    ///     You can't request more data than this.
    ///     This is needed to avoid excessive memory usage when
    ///     retrieving data from DB. If you need to read all records page-to-page,
    ///     consider using <see cref="PageReader{T}" /> class.
    /// </summary>
    public const int MaxRecordsPerPage = 250;

    private readonly int _limit = MaxRecordsPerPage;

    private readonly int _offset;

    public PagingRequest() { }

    public PagingRequest(int offset, int limit)
    {
        if (offset < 0)
        {
            throw new ArgumentException("negative offset", nameof(offset));
        }

        if (limit < 0)
        {
            throw new ArgumentException("negative limit", nameof(offset));
        }

        Offset = offset;
        Limit = limit;
    }

    public int Offset
    {
        get => _offset;
        init => _offset = Math.Max(0, value);
    }

    public int Limit
    {
        get => _limit;
        init => _limit = Math.Min(MaxRecordsPerPage, value);
    }

    public string[] Ordering { get; init; } = Array.Empty<string>();
}
