using System.Collections.Generic;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.ViewModels;

public class EventInfoViewModel
{
    public EventInfoViewModel(EventInfo eventInfo)
    {
        EventInfoId = eventInfo.EventInfoId;
        Name = eventInfo.Title;
        StartDate = eventInfo.DateStart ?? null;
        EndDate = eventInfo.DateEnd ?? null;
        Description = eventInfo.Description;
        Image = new List<ImageInfo>();

        if (!string.IsNullOrWhiteSpace(eventInfo.FeaturedImageUrl))
        {
            var image = new ImageInfo
            {
                ContentUrl = eventInfo.FeaturedImageUrl,
                Description = eventInfo.FeaturedImageCaption,
            };
            Image.Add(image);
        }

        Location = new LocationInfo
        {
            Name = eventInfo.Location,
            Address = new AddressInfo
            {
                AddressLocality = eventInfo.City,
            },
        };
    }

    public int EventInfoId { get; set; }

    public string Name { get; set; }

    public LocalDate? StartDate { get; set; }

    public LocalDate? EndDate { get; set; }

    public string Description { get; set; }

    public List<ImageInfo> Image { get; set; }

    public LocationInfo Location { get; set; }

    public class LocationInfo
    {
        public string Name { get; set; }

        public AddressInfo Address { get; set; }
    }

    public class AddressInfo
    {
        public string StreetAddress { get; set; }

        public string AddressLocality { get; set; }

        public string PostalCode { get; set; }

        public string AddressRegion { get; set; }

        public string AddressCountry { get; set; }
    }

    public class ImageInfo
    {
        public string ContentUrl { get; set; }

        public string Description { get; set; }
    }
}