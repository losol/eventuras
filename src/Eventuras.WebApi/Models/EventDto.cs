using System;

namespace Eventuras.WebApi.Models
{
    public class EventDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public bool Featured { get; set; } = false;
        public string Program { get; set; }
        public string PracticalInformation { get; set; }
        public bool OnDemand { get; set; }
        public LocationDto Location { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? LastRegistrationDate { get; set; }
    }
}
