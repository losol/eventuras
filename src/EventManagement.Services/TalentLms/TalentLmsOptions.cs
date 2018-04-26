using System;
using System.Text;

namespace losol.EventManagement.Services.TalentLms
{
    public class TalentLmsOptions
    {
        public string Domain { get; set; }
        public string ApiKey { get; set; }
        public string BaseUrl => $"https://{Domain}/api/v1";
        public string ApiKeySha => 
            Convert.ToBase64String(ASCIIEncoding.ASCII.GetBytes($"{ApiKey}:"));
    }
}
