using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services;

public class PageReader<T>
{
    private readonly int _count;
    private readonly Func<int, int, CancellationToken, Task<Paging<T>>> _func;
    private Paging<T> _lastPage;
    private bool _lastPageRead;
    private int _page;
    private int _recordsRead;

    public PageReader(Func< /*offset*/int, /*limit*/int, CancellationToken, Task<Paging<T>>> func,
        int count = PagingRequest.MaxRecordsPerPage)
    {
        if (count > PagingRequest.MaxRecordsPerPage)
        {
            throw new ArgumentOutOfRangeException(nameof(count),
                $"{nameof(count)} must be not more than " +
                $"{nameof(PagingRequest)}.{nameof(PagingRequest.MaxRecordsPerPage)}");
        }

        _count = count;
        _func = func;
    }

    public async Task<bool> HasMoreAsync(CancellationToken cancellationToken = default)
    {
        await EnsureFetchedAsync(cancellationToken);
        return !_lastPageRead;
    }

    public async Task<T[]> ReadNextAsync(CancellationToken cancellationToken = default)
    {
        await EnsureFetchedAsync(cancellationToken);
        if (_lastPageRead)
        {
            throw new InvalidOperationException("Iteration is done");
        }

        _lastPageRead = true;
        return _lastPage?.Data ?? new T[0];
    }

    private async Task EnsureFetchedAsync(CancellationToken cancellationToken = default)
    {
        if (_lastPage == null)
        {
            _page = 1;
            _lastPage = await _func.Invoke(0, _count, cancellationToken);
            _recordsRead += _lastPage.Data.Length;
        }
        else if (_lastPageRead && _recordsRead > 0 && _recordsRead < _lastPage.TotalRecords)
        {
            _lastPage = await _func.Invoke(_page * _count, _count, cancellationToken);
            _lastPageRead = false;
            ++_page;
            _recordsRead += _lastPage.Data.Length;
        }
    }

    public static async Task<TP[]> ReadAllAsync<TP>(
        Func< /*offset*/int, /*limit*/int, CancellationToken, Task<Paging<TP>>> func,
        CancellationToken cancellationToken = default)
    {
        var reader = new PageReader<TP>(func);
        var result = new List<TP>();
        while (!cancellationToken.IsCancellationRequested &&
               await reader.HasMoreAsync(cancellationToken))
        {
            result.AddRange(await reader.ReadNextAsync(cancellationToken));
        }

        return result.ToArray();
    }
}
