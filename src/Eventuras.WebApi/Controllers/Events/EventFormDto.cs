using Eventuras.Domain;
using Eventuras.WebApi.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Events
{
    public class EventFormDto : IValidatableObject
    {
        public EventInfo.EventInfoType Type { get; set; } = EventInfo.EventInfoType.Course;
        public string Name { get; set; }
        [Required]
        public string Slug { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public bool ManageRegistrations { get; set; }
        public bool OnDemand { get; set; }
        public bool Featured { get; set; } = false;
        public string Program { get; set; }
        public string PracticalInformation { get; set; }
        public LocationDto Location { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public void CopyTo(EventInfo eventInfo)
        {
            if (eventInfo == null)
            {
                throw new ArgumentNullException(nameof(eventInfo));
            }

            eventInfo.Type = Type;
            eventInfo.Title = Name;
            eventInfo.Code = Slug;
            eventInfo.Category = Category;
            eventInfo.Description = Description;
            eventInfo.ManageRegistrations = ManageRegistrations;
            eventInfo.OnDemand = OnDemand;
            eventInfo.Featured = Featured;
            eventInfo.Program = Program;
            eventInfo.PracticalInformation = PracticalInformation;
            eventInfo.Location = Location?.Name;
            eventInfo.City = Location?.Address?.AddressLocality;
            eventInfo.DateStart = StartDate;
            eventInfo.DateEnd = EndDate;
        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (StartDate.HasValue && EndDate.HasValue && StartDate.Value > EndDate.Value)
            {
                yield return new ValidationResult("start date must precede end date", new List<string>
                {
                    nameof(StartDate),
                    nameof(EndDate)
                });
            }
        }
    }
}
