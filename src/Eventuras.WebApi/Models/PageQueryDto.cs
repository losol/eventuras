using System;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Models
{
    public class PageQueryDto
    {
        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;

        [Range(0, 250)]
        public int Count { get; set; } = 100;

        public int Limit => Count;

        public int Offset => (Page - 1) * Count;
    }
}
