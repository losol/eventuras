using System;

namespace Eventuras.Services
{
    public class PagingRequest
    {
        /// <summary>
        /// You can't request more data than this.
        /// This is needed to avoid excessive memory usage when
        /// retrieving data from DB. If you need to read all records page-to-page,
        /// consider using <see cref="PageReader{T}"/> class.
        /// </summary>
        public const int MaxRecordsPerPage = 100;

        private int _offset;
        private int _limit = MaxRecordsPerPage;

        public PagingRequest()
        {
        }

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

        public PagingRequest(PagingRequest request)
        {
            if (request == null)
            {
                return;
            }
            Offset = request.Offset;
            Limit = request.Limit;
        }

        public int Offset
        {
            get => _offset;
            set => _offset = Math.Max(0, value);
        }

        public int Limit
        {
            get => _limit;
            set => _limit = Math.Min(MaxRecordsPerPage, value);
        }
    }
}
