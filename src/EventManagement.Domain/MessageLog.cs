using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{
	public class MessageLog
	{
		public int MessageLogId { get; set; }
		public int EventInfoId { get; set; }
		public EventInfo EventInfo { get; set; }

		public string Recipients { get; set; }
		public string MessageContent { get; set;}
		public string MessageType { get; set; }
		public DateTime TimeStamp {get; set; } = DateTime.UtcNow;

		public string Provider { get; set; }
		public string Result { get; set; }

	}
}