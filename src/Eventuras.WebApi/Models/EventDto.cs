using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Models
{
    public class EventDto
    {
        public int Id { get; set; }
        public EventInfo.EventInfoType Type { get; set; }
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

        public EventDto()
        {
        }

        public EventDto(EventInfo e)
        {
            Id = e.EventInfoId;
            Type = e.Type;
            Name = e.Title;
            Slug = e.Code;
            Category = e.Category;
            Description = e.Description;
            Featured = e.Featured;
            Program = e.Program;
            PracticalInformation = e.PracticalInformation;
            OnDemand = e.OnDemand;
            StartDate = e.DateStart;
            EndDate = e.DateEnd;
            LastRegistrationDate = e.LastRegistrationDate;
            Location = new LocationDto
            {
                Name = e.Location,
                Address = e.City != null ? new AddressDto
                {
                    AddressLocality = e.City
                } : null
            };
        }
    }
}
