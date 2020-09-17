using System;
using System.Collections.Generic;

namespace Eventuras.Services.ExternalSync
{
    public class EventSynchronizationResult
    {
        public string ProviderName { get; }

        public List<string> CreatedUserIds { get; } = new List<string>();

        public List<string> ExistingUserIds { get; } = new List<string>();

        public List<string> PreviouslyRegisteredUserIds { get; } = new List<string>();

        public List<string> NewRegisteredUserIds { get; } = new List<string>();

        public List<string> TotalRegisteredUserIds { get; } = new List<string>();


        public List<Exception> GenericErrors { get; } = new List<Exception>();

        public IDictionary<string, Exception> UserExportErrors { get; } = new Dictionary<string, Exception>();

        public EventSynchronizationResult(string providerName)
        {
            if (string.IsNullOrEmpty(providerName))
            {
                throw new ArgumentException(nameof(providerName));
            }
            ProviderName = providerName;
        }

        public EventSynchronizationResult AddGenericError(Exception e)
        {
            if (e == null)
            {
                throw new ArgumentNullException(nameof(e));
            }
            GenericErrors.Add(e);
            return this;
        }

        public EventSynchronizationResult AddErrorForUser(string userId, Exception e)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException(nameof(userId));
            }

            if (e == null)
            {
                throw new ArgumentNullException(nameof(e));
            }
            UserExportErrors.Add(userId, e);
            return this;
        }
    }
}
