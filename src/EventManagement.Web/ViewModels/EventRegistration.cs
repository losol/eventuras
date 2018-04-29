using System;
using System.Collections.Generic;
using losol.EventManagement.Domain;

namespace losol.EventManagement.ViewModels
{
	public class EventRegistration
	{
		
		public string ParticipantName { get; set; }
		public string Email { get; set; }
		public string Phone { get; set; }
		public EventInfo EventInfo {get;set;}
		public bool HasOrder {get;set;}
		public List<Order> Orders {get;set;}
		// TODO REMOVE HTML?
		public string OrdersHtml { get; set; }
		public string EventUrl { get; set; }
		public bool Verified { get;set; }
		public string VerificationUrl { get; set; }

	}
}