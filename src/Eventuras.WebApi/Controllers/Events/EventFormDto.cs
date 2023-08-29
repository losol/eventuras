using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.Events
{
    public class EventFormDto : IValidatableObject
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Slug { get; set; }

        public EventInfo.EventInfoType Type { get; set; } = EventInfo.EventInfoType.Course;
        public EventInfo.EventInfoStatus Status { get; set; } = EventInfo.EventInfoStatus.Draft;
        public int OrganizationId { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public bool ManageRegistrations { get; set; }
        public bool OnDemand { get; set; }
        public bool Featured { get; set; } = false;
        public string Program { get; set; }
        public string PracticalInformation { get; set; }
        public string Location { get; set; }
        public string City { get; set; }
        public LocalDate? StartDate { get; set; }
        public LocalDate? EndDate { get; set; }
        public EventInfoOptionsDto Options { get; set; } = new(new());

        public void CopyTo(EventInfo eventInfo)
        {
            if (eventInfo == null) { throw new ArgumentNullException(nameof(eventInfo)); }

            eventInfo.Type = Type;
            eventInfo.Status = Status;
            eventInfo.Title = Title;
            eventInfo.Slug = Slug;
            eventInfo.OrganizationId = OrganizationId;
            eventInfo.Category = Category;
            eventInfo.Description = Description;
            eventInfo.ManageRegistrations = ManageRegistrations;
            eventInfo.OnDemand = OnDemand;
            eventInfo.Featured = Featured;
            eventInfo.Program = Program;
            eventInfo.PracticalInformation = PracticalInformation;
            eventInfo.Location = Location;
            eventInfo.City = City;
            eventInfo.DateStart = StartDate;
            eventInfo.DateEnd = EndDate;
            eventInfo.Options = Options.MapToEntity();
        }

        public static EventFormDto FromEntity(EventInfo entity)
        {
            return new EventFormDto
            {
                Title = entity.Title,
                Slug = entity.Slug,
                Type = entity.Type,
                Status = entity.Status,
                OrganizationId = entity.OrganizationId,
                Category = entity.Category,
                Description = entity.Description,
                ManageRegistrations = entity.ManageRegistrations,
                OnDemand = entity.OnDemand,
                Featured = entity.Featured,
                Program = entity.Program,
                PracticalInformation = entity.PracticalInformation,
                Location = entity.Location,
                City = entity.City,
                StartDate = entity.DateStart,
                EndDate = entity.DateEnd,
                Options = EventInfoOptionsDto.MapFromEntity(entity.Options),
            };
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