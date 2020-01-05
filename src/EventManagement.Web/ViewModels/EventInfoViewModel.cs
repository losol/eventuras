using System;
using System.Collections.Generic;
using losol.EventManagement.Domain;
using static losol.EventManagement.Domain.EventInfo;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.ViewModels
{
    public class EventInfoViewModel
    {
        public EventInfoViewModel(EventInfo eventInfo)
        {
            this.EventInfoId = eventInfo.EventInfoId;
            this.Title = eventInfo.Title;
        }

        public int EventInfoId { get; set; }
        public string Title { get; set; }
    }
}

