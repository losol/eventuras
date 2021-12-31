using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Events
{
    public class EventDto
    {
        public int Id { get; set; }
        public EventInfo.EventInfoType Type { get; set; }
        public EventInfo.EventInfoStatus Status { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public bool Featured { get; set; } = false;
        public string Program { get; set; }
        public string PracticalInformation { get; set; }
        public string Location { get; set; }
        public string City { get; set; }
        public bool OnDemand { get; set; }
        public DateTime? DateStart { get; set; }
        public DateTime? DateEnd { get; set; }
        public DateTime? LastRegistrationDate { get; set; }

        public EventDto()
        {
        }

        public EventDto(EventInfo e)
        {
            Id = e.EventInfoId;
            Type = e.Type;
            Status = e.Status;
            Title = e.Title;
            Slug = e.Slug;
            Category = e.Category;
            Description = e.Description;
            Featured = e.Featured;
            Program = e.Program;
            PracticalInformation = e.PracticalInformation;
            OnDemand = e.OnDemand;
            DateStart = e.DateStart;
            DateEnd = e.DateEnd;
            LastRegistrationDate = e.LastRegistrationDate;
            Location = e.Location;
            City = e.City;
        }
    }
}
