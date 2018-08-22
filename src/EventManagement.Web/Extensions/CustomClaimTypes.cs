namespace losol.EventManagement.Web.Extensions
{
    public static class CustomClaimTypes
    {
        /// <summary>
        /// True if the user is a staff for any of the registrations
        /// </summary>
        public static string IsStaff => "IsStaff";

        /// <summary>
        /// ID of the event the user is a staff for.
        /// </summary>
        public static string StaffEventId => "StaffRegistrationIds";
    }
}
