using System;
using System.Collections.Generic;

namespace losol.EventManagement.Services.Lms
{
    public class EventSynchronizationResult
    {
        public List<string> CreatedUserIds { get; } = new List<string>();

        public List<string> ExistingUserIds { get; } = new List<string>();

        public List<string> EnrolledUserIds { get; } = new List<string>();

        public IDictionary<string, Exception> Errors { get; } = new Dictionary<string, Exception>();
    }
}