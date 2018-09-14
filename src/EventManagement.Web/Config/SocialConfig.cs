namespace losol.EventManagement.Web.Config
{
    public class Social
    {
        public FacebookConfig Facebook { get; set; }

        public class FacebookConfig
        {
            public string AppId { get; set; }
            public string AppSecret { get; set; }
        }
    }
}
