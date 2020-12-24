using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain
{

    public class Collection
    {

        [Key]
        public int CollectionId { get; set; }
        public Guid CollectionGuid { get; set; } = Guid.NewGuid();

        public int OrganizationId { get; set; }
        [ForeignKey("OrganizationId")]
        public Organization Organization { get; set; }

        [Required]
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Description { get; set; }
        public bool Featured { get; set; } = false;

        public string FeaturedImageUrl { get; set; }
        public string FeaturedImageCaption { get; set; }

        // Navigational properties
        // Any event could belong to several collections
        public List<EventInfo> EventInfos { get; set; }
    }
}