using System;

namespace EventManagement.Services.TalentLms
{
    public class TalentLmsException : Exception
    {
        public TalentLmsException(string message) : base(message)
        {
        }

        public TalentLmsException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
