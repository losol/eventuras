using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain
{

    public class EventCollection
    {
        [Required]
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CollectionId { get; set; }

        public int OrganizationId { get; set; }

        [ForeignKey(nameof(OrganizationId))]
        public Organization Organization { get; set; }

        [Required]
        public string Name { get; set; }

        public string Slug { get; set; }

        public string Description { get; set; }

        public bool Featured { get; set; } = false;

        public string FeaturedImageUrl { get; set; }

        public string FeaturedImageCaption { get; set; }

        public virtual ICollection<EventInfo> Events { get; set; }

        public virtual List<EventCollectionMapping> EventMappings { get; set; }
    }
}